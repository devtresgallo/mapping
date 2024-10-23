/* Grupo Mundus I+D+i
 * Universidad de Cantabria
 * Año 2024
 * Proyecto: La ciudad en acción: Resistenctias, (Re)significaciones del orden 
 *           y Cultura Política en la Monarquía Hispánica
 * Autoría: Daniel Tresgallo – https://github.com/devtresgallo/
 */

$(function () {

    const mapName = "sevilla1521";
    const dataFolder = "../data/sevilla/" + mapName.toLowerCase() + "/";
    const suffix = ".json";

    ///////////////////// Vertical, Horizontal
    var topLeft = L.latLng(37.40787, -6.00172),
    topRight = L.latLng(37.40296, -5.97467),
    botLeft = L.latLng(37.37819, -6.00868),
    botRight = L.latLng(37.37263, -5.98073);

    ///////// Variable declaration /////////
    var layerMap, subLayers = {};
    var imageLayer = null;
    var layersControl = {};
    var markers = null;
    var route1 = null;
    var plazaFeria = null;

    ///////// Adding markers and routes /////////
    loadLayers();
    addBibliography(mapName, suffix);

    ///////// Functions /////////

    async function loadLayers() {
        try {
            [markers, route1, imageLayer, plazaFeria] 
            = await Promise.all([
                addMarkers(dataFolder + mapName + "_markers" + suffix, ""),
                insertImageRef(mediaFolder + "sevilla.jpg", topLeft, topRight, botLeft, botRight),

                plazaFeriaCircle(37.399146, -5.991400, 'red', '#f03', 25)
            ]);
    
            layerMap = L.layerGroup([markers, imageLayer]);
            
            subLayers = {
                'Markers': markers,
                'Imagen': imageLayer
            };

            layersControl = L.control.layers(null, subLayers).addTo(map);

            layerMap.addTo(map);

        } catch (error) {
            console.error('Error al cargar las rutas: ', error);
        }
    }

    async function plazaFeriaCircle(lat, long, _color, _fillColor, _radius){
        try {
            const polygonLayer = L.featureGroup();
            L.circle([lat, long], {
                color: _color,
                fillColor: _fillColor,
                fillOpacity: 0.5,
                radius: _radius
            }).addTo(polygonLayer);

            return polygonLayer;
        } catch (error) {
            console.error('Error al insertar polígonos:', error);
            return null;
        }
    }

    // Slider opacidad //
    $("#sldOpacity").on('change', function(){
        imageLayer.eachLayer(function(layer) {
            if (layer.setOpacity) {
                layer.setOpacity(this.value);
            }
        }, this);
        $("#img-opacity").html(this.value * 100 + "%");
    });

    // Map events //
    window.addEventListener('hashchange', function (){
        const overlay = document.querySelector("#sky");
        const dateEvents = document.querySelector("#date");
        overlay.style.opacity = "0";
        dateEvents.style.opacity = "0";
        const hash = window.location.hash;

        clearMapElements();
        switch (hash) {
            case "#1":
                break;
            case "#2":
            case "#3":
            case "#4":             
            case "#5":
                plazaFeria.addTo(map);
                break;

            default:
                overlay.style.opacity = "0";
                dateEvents.style.opacity = "0";
                clearMapElements();
                break;
        }

        function clearMapElements(){
            clearLayer(plazaFeria);
        }

        function clearLayer(layer){
            map.removeLayer(layer);
        }
    })
});
