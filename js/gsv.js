
function setupGSV() {

    //$('<div id="streetViewIcon" ><i style="cursor:pointer" onClick="showGSV()" class="fa fa-street-view fa-2x" ></i></div>').insertAfter('.esri-basemap-toggle.esri-widget');
    //let newNode = document.createElement("span")
    //let i = document.createElement("i");
    //i.classList.add("fa","fa-street-view", "fa-2x");    
   //var p = document.getElementsByClassName("esri-basemap-toggle")
}


function showGSV() {
    if(!app.streetViewActive){
        var streetLayer = app.view.map.findLayerById("streetViewAvailability");
        streetLayer.visible = true;
        app.streetViewActive = true;
        app.view.popup.autoOpenEnabled = false;
        
        document.getElementById("streetViewIcon").childNodes[0].classList.add("activeStreeView");
        //document.getElementById("info").innerHTML = "Click on map to see streetview"
        //app.sketchViewModel.create("point")
    }else{
        var streetLayer = app.view.map.findLayerById("streetViewAvailability");
        streetLayer.visible = false;
        app.streetViewActive = false;
        app.view.popup.autoOpenEnabled = true
        document.getElementById("streetViewIcon").childNodes[0].classList.remove("activeStreeView")
    }
  
}

