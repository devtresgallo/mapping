/* Grupo Mundus I+D+i
 * Universidad de Cantabria
 * Año 2024
 * Proyecto: La ciudad en acción: Resistenctias, (Re)significaciones del orden 
 *           y Cultura Política en la Monarquía Hispánica
 * Autoría: Daniel Tresgallo – https://github.com/devtresgallo/
 */

$(function () {

    const mapName = "mexico1692";
    const dataFolder = "../data/mexico/" + mapName.toLowerCase() + "/";
    const suffix = ".json";

    ///////////////////// Vertical, Horizontal
    var topLeft = L.latLng(19.457812, -99.154398),
    topRight = L.latLng(19.452061, -99.115756),
    botLeft = L.latLng(19.413465, -99.160001),
    botRight = L.latLng(19.407841, -99.121361);

    ///////// Variable declaration /////////
    var layerMap, subLayers = {};
    var markers, imageLayer = null;
    var firePalacio, fireMarquesValle, fireCasaMoneda = null;
    var nobleHorse, route1, routeNoble, routeClerics = null;
    var layersControl = {};

    ///////// Adding markers and routes /////////
    loadLayers();
    addBibliography(mapName, suffix);

    ///////// Functions /////////

    async function loadLayers() {
        var firePalacioText = '"La muchedumbre juntó entonces un gran número de objetos de madera que pudieron reunir frente al palacio y les prendieron fuego."';
        var fireMarquesText = 'Casa del Marqués del Valle';

        try {
            [markers, imageLayer, plazaMayor, plazaVolador, firePalacio, fireMarquesValle, fireCasaMoneda, nobleHorse,
                route1, routeNoble, routeClerics] 
            = await Promise.all([
                addMarkers(dataFolder + mapName + "_markers" + suffix, ""),
                insertImageRef(mediaFolder + "mexico.jpg"),
                plazaCircle(19.432621, -99.133126, 'red', '#f03', 100),
                plazaCircle(19.431150, -99.131781, 'red', '#f03', 50),
                
                setFire(19.432546, -99.131915, firePalacioText),
                setFire(19.435267, -99.136124, fireMarquesText),
                setFire(19.433450, -99.130304, "Casa de la Moneda"),
                addMarkerNoble(19.433100, -99.133126, "horse", "purple"),
                
                addRoute(dataFolder + mapName + "_route1" + suffix, "red", "red"),
                addRoute(dataFolder + mapName + "_routeNoble" + suffix, "purple", "purple"),
                addRoute(dataFolder + mapName + "_routeClerics" + suffix, "blue", "blue")
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

    async function addMarkerNoble(_lat, _long, _icon, _color){
        try {
            const layerGroup = L.featureGroup();
    
            var _extraMarker = L.ExtraMarkers.icon({
                icon: "fa-" + _icon,
                markerColor: (_color != "" ? _color : markerColor),
                shape: 'circle',
                prefix: 'fa'
            });
            _myIcon = _extraMarker;
            L.marker([_lat, _long], {icon: _myIcon})
            .addTo(layerGroup);
    
            return layerGroup;
            
        } catch (error) {
            console.error('Error al insertar marcador noble: ', error);
            return null;
        }
    }

    async function setFire(lat, long, popupText){
        try {
            const polygonLayer = L.featureGroup();

            var fireIcon = L.icon({
                iconUrl: '../media/flame-icon.png',
                iconSize: [46, 61.5],
                popupAnchor: [-3, -76],
            });
        
            var fireMarker = L.marker([lat, long], {icon: fireIcon}).addTo(polygonLayer);
            fireMarker.bindPopup(popupText);

            return polygonLayer;
        } catch (error) {
            console.error('Error al insertar polígonos: ', error);
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
                case "#2":
                    dateEvents.innerHTML = "06/06/1692";
                    dateEvents.style.opacity = "1";
                    break;
                case "#3":
                    dateEvents.innerHTML = "07/06/1692";
                    dateEvents.style.opacity = "1";
                    break;
                case "#4":
                    dateEvents.innerHTML = "08/06/1692";
                    dateEvents.style.opacity = "1";
                    route1.addTo(map);               
                    break;
                case "#5":
                    firePalacio.addTo(map);
                    nobleHorse.bindPopup('"Mientras tanto, los insurrectos apedrearon a un noble a caballo que trató de adentrarse en la plaza para intentar reprimirlos, así como al cochero del arzobispo."');
                    nobleHorse.addTo(map);
                    routeNoble.addTo(map);
                    break;
                case "#6":
                    plazaMayor.addTo(map);
                    plazaVolador.addTo(map);
                    break;
                case "#7":
                    firePalacio.addTo(map);
                    fireMarquesValle.addTo(map);
                    fireCasaMoneda.addTo(map);
                    break;
                case "#8":
                    clearLayer(firePalacio);
                    routeClerics.addTo(map);
                    break;
                case "#10":
                    plazaMayor.addTo(map);
                    routeNoble.addTo(map);                    
                    overlay.style.backgroundColor = "rgba(25, 25, 112, 0.6)";
                    overlay.style.opacity = "1";
                    break;
                default:
                    overlay.style.opacity = "0";
                    clearMapElements();
                    break;
            }
        }, 1000);

        function clearMapElements(){
            clearLayer(route1);
            clearLayer(plazaMayor);
            clearLayer(plazaVolador);
            clearLayer(fireMarquesValle);
            clearLayer(fireCasaMoneda);
            clearLayer(nobleHorse);
            clearLayer(routeNoble);
            clearLayer(routeClerics);
            firePalacioPopup();
        }

        function clearLayer(layer){
            map.removeLayer(layer);
        }

        function firePalacioPopup(){
            var popupText = (hash.substring(1) < 7 ) ? 
                '"La muchedumbre juntó entonces un gran número de objetos de madera que pudieron reunir frente al palacio y les prendieron fuego."' :
                'El palacio virreinal acabó finalmente reducido a escombros';
            firePalacio.bindPopup(popupText);
        }
    })
});
