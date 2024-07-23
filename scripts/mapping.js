///////// Variable declaration /////////
const mediaFolder = "../media/";
var layerMap, subLayers = {};
var imageLayer;
var layersControl = {};
var markers = null, 
    route1 = null, 
    route2 = null, 
    route3 = null, 
    route4 = null,
    route5 = null;

///////// Functions /////////
async function loadLayers(dataFolder, mapName, mapImage, _corners) {
    try {
        [markers, route1, route2, route3, route4, route5, imageLayer] = await Promise.all([
            addMarkers(dataFolder + mapName + "_markers.json", ""),
            addRoute(dataFolder + mapName + "_route1-1.json", "blue", "blue"),
            addRoute(dataFolder + mapName + "_route1-2.json", "blue", "blue"),
            addRoute(dataFolder + mapName + "_route1-3.json", "blue", "blue"),
            addRoute(dataFolder + mapName + "_route1-4.json", "blue", "blue"),
            addRoute(dataFolder + mapName + "_route2.json", "red", "red"),
            insertImageRef(mediaFolder + mapImage +".jpg", _corners)
        ]);

        layerMap = L.layerGroup([markers, route1, route2, route3, route4, route5, imageLayer]);
        
        subLayers = {
            'Markers': markers,
            'Ruta 1': route1,
            'Ruta 2': route2,
            'Ruta 3': route3,
            'Ruta 4': route4,
            'Ruta 5': route5,
        };

        layersControl = L.control.layers(null, subLayers).addTo(map);

        layerMap.addTo(map);

    } catch (error) {
        console.error('Error al cargar las capas: ', error);
    }
}    

function insertImageRef(url, _corners) {
    imageLayer = L.distortableImageOverlay(url, {
        corners: _corners
    });
    return imageLayer;    
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