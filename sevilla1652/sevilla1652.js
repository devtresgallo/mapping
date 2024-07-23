/* Grupo Mundus I+D+i
 * Universidad de Cantabria
 * Año 2024
 * Proyecto: Revueltas y conflictos Sevilla y México
 * Autoría: Daniel Tresgallo – https://github.com/devtresgallo/
 */

$(function () {

    const mapName = "sevilla1652";
    const dataFolder = "../data/sevilla/" + mapName.toLowerCase() + "/";

    ///////////////////// Vertical, Horizontal
    var topLeft = L.latLng(37.40787, -6.00172),
    topRight = L.latLng(37.40296, -5.97467),
    botLeft = L.latLng(37.37819, -6.00868),
    botRight = L.latLng(37.37263, -5.98073);

    ///////// Adding markers and routes /////////
    loadLayers(dataFolder, mapName, "sevilla", [topLeft, topRight, botLeft, botRight]);


    ///////// Show / hide layers while navigating chapters /////////
    window.addEventListener('hashchange', () => {
        var hash = location.hash.substring(1);
        showHideLayers(hash);
    });
    
    function hideLayers(layerList){
        layerList.forEach(layer => {
            if(map.hasLayer(layer)){
                map.removeLayer(layer);
            } 
        });
    }
    
    function showLayers(layerList){
        layerList.forEach(layer => {            
            if(!map.hasLayer(layer)){
                map.addLayer(layer);
            }
        });
    }    

    function showHideLayers(hashValue){
        switch (hashValue) {
            case "1":
                showLayers([route1, route2, route3, route4, route5]);
            case "2":
            case "3":
                showLayers([route1]);
                hideLayers([route2, route3, route4, route5]);
                break;
            case "4":
                showLayers([route2])
                hideLayers([route1, route3, route4, route5]);
                break;
            case "5":
                showLayers([route3])
                hideLayers([route1, route2, route4, route5]);             
                break;
            case "6":
            case "7":
                showLayers([route4])
                hideLayers([route1, route2, route3, route5]);             
                break;
            case "8":
                showLayers([route1, route2, route3, route4, route5]);
            default:
                break;
        }
    }

    // Slider opacidad //
    $("#sldOpacity").on('change', function(){
        imageLayer.setOpacity(this.value);
        $("#img-opacity").html(this.value * 100 + "%");
    });
});
