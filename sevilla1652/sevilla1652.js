/* Grupo Mundus I+D+i
 * Universidad de Cantabria
 * Año 2024
 * Proyecto: La ciudad en acción: Resistenctias, (Re)significaciones del orden 
 *           y Cultura Política en la Monarquía Hispánica
 * Autoría: Daniel Tresgallo – https://github.com/devtresgallo/
 */

$(function () {

    const mapName = "sevilla1652";
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
    var markers = null, 
        route1 = null, 
        route2 = null, 
        route3 = null, 
        route4 = null;

    ///////// Adding markers and routes /////////
    loadLayers();
    addBibliography(mapName, suffix);

    ///////// Functions /////////

    async function loadLayers() {
        try {
            [markers, route1, route2, route3, route4, imageLayer] 
            = await Promise.all([
                addMarkers(dataFolder + mapName + "_markers" + suffix, ""),
                addRoute(dataFolder + mapName + "_route1" + suffix, "blue", "blue"),
                addRoute(dataFolder + mapName + "_route2" + suffix, "blue", "blue"),
                addRoute(dataFolder + mapName + "_route3" + suffix, "blue", "blue"),
                addRoute(dataFolder + mapName + "_route4" + suffix, "blue", "blue"),
                addRoute(dataFolder + mapName + "_route5" + suffix, "red", "red"),
                insertImageRef(mediaFolder + "sevilla.jpg", topLeft, topRight, botLeft, botRight)
            ]);
    
            layerMap = L.layerGroup([markers, route1, route2, route3, route4, imageLayer]);
            
            subLayers = {
                'Markers': markers,
                'Ruta 1': route1,
                'Ruta 2': route2,
                'Ruta 3': route3,
                'Ruta 4': route4,
                'Imagen': imageLayer
            };

            layersControl = L.control.layers(null, subLayers).addTo(map);

            layerMap.addTo(map);

        } catch (error) {
            console.error('Error al cargar las rutas: ', error);
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
                break;
            case "#3":
                break;
            case "#4":             
                break;
            case "#5":
                break;
            case "#6":
                break;
            case "#7":
                break;
            case "#8":
                break;
            case "#9":
                break;
            case "#10":
                break;
            case "#13":
                break;
            case "#15":
                break;
            case "#19":
                break;

            default:
                overlay.style.opacity = "0";
                dateEvents.style.opacity = "0";
                clearMapElements();
                break;
        }

        function clearMapElements(){
            clearLayer();
        }

        function clearLayer(layer){
            map.removeLayer(layer);
        }
    })
});
