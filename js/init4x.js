var app = {
        zoom: 2,
        lonlat: [-40,0],
        view: null, 
        mapDiv: "mapViewDiv",
        streetViewActive:false,
        sketchViewModel:null,
        featureTable:null,
        selectedFeatures:null,
        homeWidget:null,
        ref:null,
        propertyResults:null,
        isSelectingProperties:false,
        regionCenter:null
}
var activeWidget = null;
require([
    // ArcGIS
    "esri/WebMap",
    "esri/views/MapView",

    // Widgets
    "esri/widgets/Home",
    "esri/widgets/Zoom",
    "esri/widgets/Compass",
    "esri/widgets/Search",
    "esri/widgets/Legend",
    "esri/widgets/BasemapToggle",
    "esri/widgets/ScaleBar",
    "esri/widgets/Attribution",
    "esri/widgets/Expand",
    // Bootstrap
    "bootstrap/Collapse",
    "bootstrap/Dropdown",

    // Calcite Maps
    "calcite-maps/calcitemaps-v0.10",
    // Calcite Maps ArcGIS Support
    "calcite-maps/calcitemaps-arcgis-support-v0.10",
    "esri/config",
    "esri/portal/Portal",
    "esri/identity/OAuthInfo",
    "esri/identity/IdentityManager",
    "esri/widgets/Print",
    "esri/widgets/LayerList",
    "esri/layers/WebTileLayer",
    "esri/layers/GraphicsLayer",
    "esri/core/Collection",
    "esri/widgets/FeatureTable",
    "esri/widgets/Sketch/SketchViewModel",
    "esri/Graphic",
    "esri/geometry/geometryEngineAsync",
    "esri/geometry/support/webMercatorUtils",
    "esri/geometry/Polygon",
    "esri/widgets/FeatureTable/Grid/support/ButtonMenu",
    "esri/widgets/FeatureTable/Grid/support/ButtonMenuItem",
    "dojo/domReady!"
], function (WebMap, MapView, Home, Zoom, Compass, Search, Legend, BasemapToggle, ScaleBar, Attribution,Expand, Collapse, Dropdown, 
    CalciteMaps, CalciteMapArcGISSupport, 
    esriConfig, Portal, OAuthInfo, esriId, Print,LayerList,WebTileLayer,GraphicsLayer,Collection,FeatureTable,SketchViewModel,
    Graphic,geometryEngineAsync,webMercatorUtils,Polygon,
    ButtonMenu,ButtonMenuItem) {


    esriConfig.portalUrl = "https://lwweb01.geronimoenergy.local/portal/sharing";



    const info = new OAuthInfo({
        // Swap this ID out with registered application ID
        appId: "ZvN0DSivA9fHWHp1",
        // Uncomment the next line and update if using your own portal
        portalUrl: "https://lwweb01.geronimoenergy.local/portal",
        // Uncomment the next line to prevent the user's signed in state from being shared with other apps on the same domain with the same authNamespace value.
        // authNamespace: "portal_oauth_inline",
        popup: false,
        preserveUrlHash:true

    });

    
    esriId.registerOAuthInfos([info]);

    esriId.getCredential(info.portalUrl + "/sharing");



    esriId.checkSignInStatus(info.portalUrl + "/sharing")
        .then((e) => {
            loadMap();
        })
        .catch((e) => {
            console.log(e)
    });


    function loadMap() {

        const mapId = getWebMapId();

        // Map
        var map = new WebMap({
            portalItem: {
                id: mapId
            }
        });

        // View
        var mapView = new MapView({
            container: "mapViewDiv",
            map: map,
            padding: {
                top: 50,
                bottom: 0
            },
            ui: { components: [] }
        });

        mapView.watch('updating', function(evt){        
            if(evt === true){
                $("#map_loading_spinner").show();
            }else {
                $("#map_loading_spinner").hide();
            }
        });

        app.view = mapView;



        const selectionGraphicsLayer = new GraphicsLayer({id:"selection_graphic","listMode":"hide"});
        mapView.map.add(selectionGraphicsLayer);

        app.sketchViewModel = new SketchViewModel({
            view: mapView,
            layer: selectionGraphicsLayer
        });

        app.sketchViewModel.on("create", async (event) => {
            if (event.state === "complete") {
              // this polygon will be used to query features that intersect it
              const geometries = selectionGraphicsLayer.graphics.map(function(graphic){
                return graphic.geometry
              });
              const queryGeometry = await geometryEngineAsync.union(geometries.toArray());
              selectLayerFeatures(queryGeometry);
              
              /*if(app.isSelectingProperties == true){
                queryLayer(queryGeometry);
              }else{
                selectLayerFeatures(queryGeometry);
              }*/
            }
        });
        
        // Popup and panel sync
        mapView.when(function (m) {

            app.regionCenter = webMercatorUtils.webMercatorToGeographic(mapView.center);

             
            const refNumbers = m.map.portalItem.tags.filter(function (e) {
                return e.match(/lg-ref:/g)
            })

            if(refNumbers.length) {
                const refNumber = refNumbers[0].split(":")[1];
                app.ref = refNumber;

                $.ajax({
                    method: 'POST',
                    url: 'https://tiles.makeloveland.com/api/v1/sources?token=' + refNumber,
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json',
                    data: JSON.stringify({
                      "query": {
                        "parcel": true,
                      },
                      "styles": "Map { background-color: rgba(0,0,0,0); } #loveland { line-color: blue;line-width: 1.2; }",
                    }),
                  }).done(function(data) {
                       var tiledLayer = new WebTileLayer({urlTemplate: data.tiles[0],"id":"parcel_boundary",visible:false,title:"Parcel Boundary","minScale":115200, copyright:"Landgrid Map tiles"});
                       mapView.map.add(tiledLayer);
                  })
            }
            

            document.getElementById("mapTitle").innerHTML =  mapView.map.portalItem.title
            var print = new Print({
                view: mapView,
                // specify your own print service
                printServiceUrl: "https://lwweb01.geronimoenergy.local/arcgis/rest/services/GPServices/CustomExportWebMap/GPServer/Export%20Web%20Map",
                container:"printDiv"
              });

            var layerList = new LayerList({
                view: mapView,
                container:"layersDiv"
            });

            CalciteMapArcGISSupport.setPopupPanelSync(mapView);

            
            mapView.map.allLayers.forEach(function(lyr) {
                if(lyr.type == "feature"){

                   $("#selectLayer").append("<option value='" + lyr.id + "'>" + lyr.title + "</option>" )
                }
                
            });

            $("#FilterDiv").on("change","#selectLayer",function(e) {
                var selectedLayerId = $(this).val();

                if(selectedLayerId){
                    initDataTable(selectedLayerId);
                    $("#toggle-table").show();
                }
            })

            initGSV();

            initTour();
        });

        mapView.on("click",function(evt) {
            
            if(app.streetViewActive){
                window.open(`http://maps.google.com/maps?q=&layer=c&cbll=${evt.mapPoint.latitude},${evt.mapPoint.longitude}&cbp=11,0,0,0,0`);
                showGSV();
            }else{
                const lyr = mapView.map.findLayerById("parcel_boundary");
                if(lyr && lyr.visible == true){
                    const geoPoint = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);
                    //console.log(geoPoint)
                    queryByLocation(geoPoint);
                }
            }
        })

        // Search - add to navbar
        var searchWidget = new Search({
            container: "searchWidgetDiv",
            view: mapView
        });
        CalciteMapArcGISSupport.setSearchExpandEvents(searchWidget);

        // Map widgets
        var home = new Home({
            view: mapView
        });
        mapView.ui.add(home, "top-left");
        

        var zoom = new Zoom({
            view: mapView
        });
        mapView.ui.add(zoom, "top-left");

        var compass = new Compass({
            view: mapView
        });
        mapView.ui.add(compass, "top-left");

         // Panel widgets - add legend
         const legend = new Expand({
            content: new Legend({
              view: mapView,
              style: "card" // other styles include 'classic'
            }),
            view: mapView,
            expanded: false
          });
        mapView.ui.add(legend, "top-left");

        var basemapToggle = new BasemapToggle({
            view: mapView,
            nextBasemap: "topo"
        });
        mapView.ui.add(basemapToggle, "bottom-right");

        var scaleBar = new ScaleBar({
            view: mapView
        });
        mapView.ui.add(scaleBar, "bottom-left");

        mapView.ui.add("topbar", "top-right");
        

    }


    function initGSV(){
        
        var streetViewTileLayer = new WebTileLayer("https://maps.googleapis.com/maps/vt?lyrs=svv&apiv3&style=40,18&gl=US&&x={col}&y={row}&z={level}", {
            id: 'streetViewAvailability',
            title: ' StreetView Availability',
            copyright: 'Google',
            opacity: 1,
            minScale: 500000,
            visible: false,
            listMode:"hide"
        });
        app.view.map.add(streetViewTileLayer);

        setupGSV();
    
    }

    function queryByLocation(mapPoint){
        $("#map_loading_spinner").show();
        $.get( "https://landgrid.com/api/v1/search.json",{ lat:mapPoint.y ,lon:mapPoint.x ,token:app.ref}, 
           function( data ) {
             if(data.results.length){
                //app.propertyResults = data.results;
                $("#map_loading_spinner").hide();
                const queryData = data.results.map( (feature) => {
                    const polygon = new Polygon({
                        rings: feature.geometry.coordinates,
                        spatialReference: { wkid: 4326 }
                    });
                    return {geometry:polygon,attributes:feature.properties.fields,alias:feature.properties.field_labels}

                });
                
                const fields = [];
                for (const [key, value] of Object.entries(data.results[0].properties.field_labels)) {
                    console.log(`${key}: ${value}`);
                    fields.push({name:key,alias:value});
                  }
                  
                renderQueryResults({"features":queryData,fields:fields},Graphic,)
             }
        });
    
    
    }


    function initDataTable(layerId){

        if(app.featureTable){
            app.featureTable.destroy();
            app.featureTable = null;
            var tableDiv = document.createElement('div'); 
            tableDiv.setAttribute("id", "tableDiv");
            document.getElementById("tableContainer").appendChild(tableDiv);
        }
        
        $(".container").show();

       var lyr = app.view.map.findLayerById(layerId);
       
       if(!lyr) {
           console.log("error loading layer")
           return false
       }
       
       if(!lyr.visible) {
           lyr.visible = true;
       }

       const fieldMap = lyr.fields.filter(function (f) {
           return f.type !== "oid" || f.name.match(/Shape/gi) == -1
       }).map( function(e) {
          return {"name":e.name,"label":e.alias}
          
       });

       
      const buttonMenu = new ButtonMenu ({
        items: [{
            label: "Export to CSV",
            iconClass: "esri-icon-file-excel",
            clickFunction: function (event) {
                
                if(app.selectedFeatures){
                    configExportTOCSV(app.selectedFeatures)
                }else{
                    const query = {
                        where: "1=1",
                        outFields: ["*"],
                        returnGeometry:false
                    };            
                    // query graphics from the csv layer view. Geometry set for the query
                    // can be polygon for point features and only intersecting geometries are returned
                    app.featureTable.layer.queryFeatures(query)
                        .then((results) => {
                            configExportTOCSV(results.features);
    
                    });
                }
            }
        }]
      });
       
       app.featureTable = new FeatureTable({
        view: app.view,
        layer: lyr,
        highlightOnRowSelectEnabled: false,
        fieldConfigs: fieldMap,
        menuConfig:buttonMenu,
        highlightOnRowSelectEnabled:true,
        container: document.getElementById("tableDiv")
      });

      app.featureTable.on("selection-change",function(e) {
          if(e.added.length){              
              app.view.goTo(e.added[0].feature);
          }
      })

      setTimeout(function(){
        $(".esri-feature-table__loader-container").html('<a role="button" onclick="toggleTablePanel()" ><span style="display:inline;color:black;font-size:24;font-weight:bold;margin-top:10px;" class="esri-icon-close"></span></a>');

      },2000)
      
      

    }





});

