/* Grupo Mundus I+D+i
 * Universidad de Cantabria
 * Año 2024
 * Proyecto: La ciudad en acción: Resistenctias, (Re)significaciones del orden 
 *           y Cultura Política en la Monarquía Hispánica
 * Autoría: Daniel Tresgallo – https://github.com/devtresgallo/
 */

$(function () {

    const mapName = "mexico1624";
    const dataFolder = "../data/mexico/" + mapName.toLowerCase() + "/";

    ///////////////////// Vertical, Horizontal
    var topLeft = L.latLng(19.457812, -99.154398),
    topRight = L.latLng(19.452061, -99.115756),
    botLeft = L.latLng(19.413465, -99.160001),
    botRight = L.latLng(19.407841, -99.121361);

    ///////// Variable declaration /////////
    var layerMap, subLayers = {};
    var markers, imageLayer, plazaMayor, churches, plateros = null;
    var route7, route9, route9_2, route10, route10_2, route10_3 = null;
    var layersControl = {};

    ///////// Adding markers and routes /////////
    loadLayers();

    ///////// Functions /////////

    async function loadLayers() {
        try {
            [markers, imageLayer, plazaMayor, plazaVolador, churches, plateros, 
                route7, route9, route9_2, route10, route10_2, route10_3] 
            = await Promise.all([
                addMarkers(dataFolder + mapName + "_markers.json", ""),
                insertImageRef(mediaFolder + "mexico.jpg"),
                plazaCircle(19.432621, -99.133126, 'red', '#f03', 50),
                plazaCircle(19.431150, -99.131781, 'orange', '#f50', 75),
                churchesCircles(),
                platerosCircles(),

                addRoute(dataFolder + mapName + "_route7.json", "blue", "blue"),
                addRoute(dataFolder + mapName + "_route9.json", "green", "green"),
                addRoute(dataFolder + mapName + "_route9-2.json", "darkgreen", "darkgreen"),
                addRoute(dataFolder + mapName + "_route10.json", "red", "red"),
                addRoute(dataFolder + mapName + "_route10_2.json", "red", "red"),
                addRoute(dataFolder + mapName + "_route10_3.json", "red", "red")
            ]);
    
            layerMap = L.layerGroup([markers, imageLayer]);
            
            subLayers = {
                'Markers': markers
            };

            layersControl = L.control.layers(null, subLayers).addTo(map);

            layerMap.addTo(map);

        } catch (error) {
            console.error('Error al cargar las capas: ', error);
        }
    }    

    async function insertImageRef(url){
        try {
            var latLngBounds = L.latLngBounds(topLeft, botRight);
            map.fitBounds(latLngBounds);

            var imageLayerGroup = L.featureGroup();

            var imglayer = L.distortableImageOverlay(url, {
                corners: [
                    topLeft, 
                    topRight,
                    botLeft, 
                    botRight
                ],
                mode: 'freeRotate',
            }).addTo(map);

            imageLayerGroup.addLayer(imglayer);

            return imageLayerGroup;

        } catch (error) {
            console.error('Error al añadir imagen', error);
        }        
    }

    async function addMarkers(file, markerColor){
        try {
            const response = await fetch(file);
            const responseData = await response.json();

            if(!responseData.markers || !Array.isArray(responseData.markers)){
                console.error('Formato de archivo JSON no válido');
            } 
                
            const markers = responseData.markers;
            const layerGroup = L.featureGroup();

            markers.forEach(({ icon, color, lat, long, name, desc }) => {
                var _myIcon = icon;
                if(icon.substring(0,3) == "i8-"){
                    var customIcon = L.icon({
                        iconUrl: "../markers/images/" + icon + ".png",
                        shadowUrl: "../markers/images/markers_shadow.png",
                        iconSize: [24, 24],
                        shadowSize: [35, 16],
                        shadowAnchor: [12, 6]
                    });
                    _myIcon = customIcon;
                }
                else{               
                    var _extraMarker = L.ExtraMarkers.icon({
                        icon: _myIcon,
                        markerColor: (color != "" ? color: markerColor),
                        shape: 'circle',
                        prefix: 'fa'
                    });
                    _myIcon = _extraMarker;
                    
                }
                L.marker([lat, long], {icon: _myIcon})
                        .bindPopup(`<h5>${name}</h5>` + (desc ? `<p>${desc}</p>` : ""))
                        .addTo(layerGroup);
            });

            return layerGroup;

        } catch(error){
            console.error('Error al cargar el archivo JSON de marcadores:', error);
            return null;
        }
    }

    async function addRoute(file, routeColor, markerColor){
        try {
            const response = await fetch(file);
            const responseData = await response.json();

            const markers = responseData.markers;
            const layerGroup = L.featureGroup();
            var route = [];

            markers.forEach(({ lat, long, name, point }) => {
                let text = point;
                if (name != "") {
                    text = name;
                    var _routeMarker = L.ExtraMarkers.icon({
                        icon: 'fa-number',
                        markerColor: markerColor,
                        number: point, 
                        shape: 'circle',
                        prefix: 'fa'
                    });
                    L.marker([lat, long], {icon: _routeMarker})
                        .bindPopup(`<h5>` + text + `</h5>`)
                        .addTo(layerGroup);
                }
                route.push([lat, long]);
            });
            var newRoute = L.polyline.antPath(route, {
                color: routeColor,
                delay: 4000,
                dashArray: [10, 20],
                weight: 5,
                pulseColor: "#FFFFFF",
                stroke: true
            });
            layerGroup.addLayer(newRoute);
            return layerGroup;
        } catch (error) {
            console.error('Error al cargar el archivo JSON de rutas:', error);
            return null;            
        }
        
    }

    async function plazaCircle(lat, long, _color, _fillColor, _radius){
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

    async function platerosCircles(){
        try {
            const polygonLayer = L.featureGroup();

            // San José de los Naturales
            L.circle([19.433692, -99.140084], {
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.5,
                radius: 50
            }).addTo(polygonLayer);

            // Casa profesa jesuítas
            L.circle([19.433645, -99.136345], {
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.5,
                radius: 50
            }).addTo(polygonLayer);

            return polygonLayer
        } catch (error) {
            console.error('Error al insertar polígonos de "virrey erege":', error);
            return null;
        }
    }

    async function churchesCircles(){
        try {
            const polygonLayer = L.featureGroup();

            const coords = [
                [19.438936, -99.133749], // Santo Domingo
                [19.433692, -99.140084], // San José Naturales
                [19.440967, -99.132843], // Santa Catalina
                [19.436806, -99.142546], // Veracruz
                [19.429727, -99.136422], // San Agustín
                [19.429443, -99.127841], // Convento Merced
                [19.440892, -99.129342], // Carmen
                [19.436971, -99.143665], // San Juan
                [19.428939, -99.133695], // Hospital Concepción
                [19.431528, -99.141682]  // Hospital Real
            ];

            coords.forEach(latlong => {               
                L.circle(latlong, {
                    color: 'gold',
                    fillColor: '#ffa500',
                    fillOpacity: 0.5,
                    radius: 50
                }).addTo(polygonLayer); 
            });

            return polygonLayer;

        } catch (error) {
            console.error('Error al insertar polígonos de iglesias:', error);
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
        setTimeout(() => {
            switch (hash) {
                case "#1":
                    dateEvents.style.opacity = "0";
                    break;
                case "#2":
                    dateEvents.innerHTML = "11 y 12/01/1624";
                    dateEvents.style.opacity = "1";
                    plazaMayor.addTo(map);
                    break;
                case "#3":
                    dateEvents.innerHTML = "13/01/1624";
                    dateEvents.style.opacity = "1";
                    break;
                case "#8":
                case "#11":
                    plazaMayor.radius = 100;
                    plazaMayor.addTo(map);
                    break;
                case "#4":
                    dateEvents.innerHTML = "14/01/1624";
                    overlay.style.backgroundColor = "rgba(25, 25, 112, 0.6)";
                    dateEvents.style.opacity = "1";
                    overlay.style.opacity = "1";                
                    break;
                case "#5":
                    plateros.addTo(map);
                    break;
                case "#6":
                    churches.addTo(map);
                    break;
                case "#7":
                    route7.addTo(map);
                    break;
                case "#9":
                    route9.addTo(map);
                    route9_2.addTo(map);
                    break;
                case "#10":
                    route10.addTo(map);
                    route10_2.addTo(map);
                    route10_3.addTo(map);
                    plazaVolador.addTo(map)
                    break;

                default:
                    overlay.style.opacity = "0";
                    dateEvents.style.opacity = "0";
                    clearMapElements();
                    break;
            }
        }, 1000);

        function clearMapElements(){
            clearLayer(plazaMayor);
            clearLayer(plazaVolador);
            clearLayer(churches);
            clearLayer(plateros);
            clearLayer(route7);
            clearLayer(route9);
            clearLayer(route9_2);
            clearLayer(route10);
            clearLayer(route10_2);
            clearLayer(route10_3);
        }

        function clearLayer(layer){
            map.removeLayer(layer);
        }
    })
});
