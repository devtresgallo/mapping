/* Grupo Mundus I+D+i
 * Universidad de Cantabria
 * Año 2024
 * Proyecto: Revueltas y conflictos Sevilla y México
 * Autoría: Daniel Tresgallo – https://github.com/devtresgallo/
 */

$(function () {

    const mapName = "sevilla1652";
    const dataFolder = "data/sevilla/" + mapName.toLowerCase() + "/";
    
    var osmBaseMap = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

    L.tileLayer(osmBaseMap, {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> '
    }).addTo(map);

    ///////////////////// Vertical, Horizontal
    var topLeft = L.latLng(37.40787, -6.00172),
    topRight = L.latLng(37.40296, -5.97467),
    botLeft = L.latLng(37.37819, -6.00868),
    botRight = L.latLng(37.37263, -5.98073);

    ///////// Variable declaration /////////
    var layerMap, subLayers = {};
    var imageLayer;
    var layersControl = {};
    var markers = null, 
        route1 = null, 
        route2 = null, 
        route3 = null, 
        route4 = null;

    ///////// Adding markers and routes /////////
    loadLayers();

    ///////// Functions /////////

    function insertImageRef(url){

        var latLngBounds = L.latLngBounds(topLeft, botRight);
        map.fitBounds(latLngBounds);
            
        // layer = L.imageOverlay.rotated(url,topLeft,topRight,botLeft,{
        //     opacity: 0.5,
        //     interactive: true
        // }).addTo(map);

        layer = L.distortableImageOverlay(url, {
            opacity: 0.5,
            mode: 'lock',
            corners: [
                topLeft, 
                topRight,
                botLeft, 
                botRight
            ]
        });
        // layer.setOpacity(0.5);
        return layer;
    }

    async function loadLayers() {
        try {
            [markers, route1, route2, route3, route4, imageLayer] = await Promise.all([
                addMarkers(dataFolder + mapName + "_markers.json", ""),
                addRoute(dataFolder + mapName + "_route1-1.json", "blue", "blue"),
                addRoute(dataFolder + mapName + "_route1-2.json", "blue", "blue"),
                addRoute(dataFolder + mapName + "_route1-3.json", "blue", "blue"),
                addRoute(dataFolder + mapName + "_route2.json", "red", "red"),
                imageLayer = insertImageRef("media/sevilla.jpg")
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
                        iconUrl: "markers/images/" + icon + ".png",
                        shadowUrl: "markers/images/markers_shadow.png",
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

    window.addEventListener('hashchange', () => {
        var hash = location.hash.substring(1);
        showHideLayers(hash);
    });

    function hideLayer(layer){
        if(map.hasLayer(layer)){
            map.removeLayer(layer);
        }
    }

    function showLayer(layer){
        if(!map.hasLayer(layer)){
            map.addLayer(layer);
        }
    }

    function showHideLayers(hashValue){
        switch (hashValue) {
            case "1":
            case "2":
            case "3":
            case "4":
                showLayer(route1);
                hideLayer(route2);
                hideLayer(route3);
                hideLayer(route4);                
                break;
            case "5":
                hideLayer(route1);
                showLayer(route2);
                hideLayer(route3);
                hideLayer(route4);                
                break;
            case "6":
            case "7":
                hideLayer(route1);
                hideLayer(route2);
                showLayer(route3);
                hideLayer(route4);                
                break;
            default:
                hideLayer(route1);
                hideLayer(route2);
                hideLayer(route3);
                hideLayer(route4);
                break;
        }
    }
});
