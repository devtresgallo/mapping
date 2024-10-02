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
// function insertImageRef(url, _corners) {
//     imageLayer = L.distortableImageOverlay(url, {
//         corners: _corners
//     });
//     return imageLayer;    
// }

async function insertImageRef(url, topLeft, topRight, botLeft, botRight){
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

async function addBibliography(mapName, suffix){
    $('#title').append(" \
        <button type='button' id='btnModal' class='btn btn-info btn-biblio' \
        data-toggle='modal' data-target='#biblioModal'>Bibliografía</button> \
    ");

    const biblioDiv = document.querySelector("#biblioModal"); 
    var biblioTxt = "";
    biblioDiv.querySelector(".modal-title").innerHTML = "Bibliografía";

    const response = await fetch(mapName + "_bibliography" + suffix);
    const responseData = await response.json();

    if(!responseData.biblio || !Array.isArray(responseData.biblio)){
        console.error('Formato de archivo JSON no válido');
    }
    
    const biblio = responseData.biblio;
    biblio.forEach(({author, title, source_auth, source, ext_data}) => {
        biblioTxt += "<p>"+author+". ";
        if(title != ""){
            biblioTxt += "\"" + title +"\" ";
        }
        if(source_auth != ""){
            biblioTxt += " en "+ source_auth +". ";
        }
        if(source != ""){
            biblioTxt += "<i>" + source+ "</i>. "
        }
        biblioTxt += " " + ext_data;
        biblioTxt += "</p>"
        biblioDiv.querySelector(".modal-body").innerHTML = biblioTxt;
    });

    $("#btnModal").on("click", function(){
        $("#biblioModal").modal(); 
      });
}