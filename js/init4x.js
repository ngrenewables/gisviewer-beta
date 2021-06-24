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
        isSelectingProperties:false
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
    "esri/layers/TileLayer",
    "esri/layers/GraphicsLayer",
    "esri/core/Collection",
    "esri/widgets/FeatureTable",
    "esri/widgets/Sketch/SketchViewModel",
    "esri/Graphic",
    "esri/tasks/QueryTask", 
    "esri/tasks/support/Query",
    "esri/geometry/geometryEngineAsync",
    "esri/widgets/FeatureTable/Grid/support/ButtonMenu",
    "esri/widgets/FeatureTable/Grid/support/ButtonMenuItem",
    "dojo/domReady!"
], function (WebMap, MapView, Home, Zoom, Compass, Search, Legend, BasemapToggle, ScaleBar, Attribution,Expand, 
    Collapse, Dropdown, CalciteMaps, CalciteMapArcGISSupport, 
    esriConfig, Portal, OAuthInfo, esriId, Print,LayerList,WebTileLayer,TileLayer,
    GraphicsLayer,Collection,FeatureTable,SketchViewModel,
    Graphic,QueryTask, Query,
    geometryEngineAsync,ButtonMenu,ButtonMenuItem) {


    esriConfig.portalUrl = "https://lwweb01.geronimoenergy.local/portal/sharing";



    const info = new OAuthInfo({
        // Swap this ID out with registered application ID
        appId: "ZvN0DSivA9fHWHp1",
        // Uncomment the next line and update if using your own portal
        portalUrl: "https://lwweb01.geronimoenergy.local/portal",
        // Uncomment the next line to prevent the user's signed in state from being shared with other apps on the same domain with the same authNamespace value.
        // authNamespace: "portal_oauth_inline",
        popup: true
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

        app.view = mapView;



        const selectionGraphicsLayer = new GraphicsLayer({id:"selection_graphic"});
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
              if(app.isSelectingProperties == true){
                queryLayer(queryGeometry);
              }else{
                selectLayerFeatures(queryGeometry);
              }
              
            }
        });
        
        // Popup and panel sync
        mapView.when(function (m) {
            
            console.log(app.view)
            
            const refNumbers = m.map.portalItem.tags.filter(function (e) {
                return e.match(/ref:/g)
            })

            if(refNumbers.length) {
                const refNumber = refNumbers[0].split(":")[1];
                app.ref = refNumber;
                var tiled = new TileLayer({url:"https://reportallusa.com/api/rest_services/client=" + refNumber + "/Parcels/MapServer",
                                visible:false,
                                "title":"Parcel Boundary",
                                "id":"parcel_boundary",
                                "minScale":28800
                            });
                mapView.map.add(tiled);
            }
            

            document.getElementById("mapTitle").innerHTML =  mapView.map.portalItem.title;
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
                if(lyr){
                    queryLayer(evt.mapPoint);
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

        /*var attribution = new Attribution({
            view: mapView
        });
        mapView.ui.add(attribution, "manual");*/

       

        mapView.ui.add("topbar", "top-right");
        

    }


    function initGSV(){
        
        var streetViewTileLayer = new WebTileLayer("https://maps.googleapis.com/maps/vt?lyrs=svv&apiv3&style=40,18&gl=US&&x={col}&y={row}&z={level}", {
            id: 'streetViewAvailability',
            title: ' StreetView Availability',
            copyright: 'Google',
            opacity: 1,
            minScale: 500000,
            visible: false
        });
        app.view.map.add(streetViewTileLayer);

        setupGSV();
    
    }


    function queryLayer(geometry){

        var queryTask = new QueryTask({
            url:"https://reportallusa.com/api/rest_services/client=" + app.ref + "/Parcels/MapServer/0"
          });
        var query = new Query();
        query.returnGeometry = true;
        query.geometry =  geometry;
        query.outFields = ["*"];
        query.outSpatialReference = { "wkid": 102100 };
        $("#loading_spinner").show();
        queryTask.execute(query).then(getResults).catch(promiseRejected);
        
       
    }

    function getResults(response){
        let symbol = {
            type: "simple-fill",  // autocasts as new SimpleFillSymbol()
            color: [ 212,200,30, 0.5 ],
            style: "solid",
            outline: {  // autocasts as new SimpleLineSymbol()
              color: "white",
              width: 1
            }
          };
       
        const grpLayer = app.view.map.findLayerById("selection_graphic");
        grpLayer.removeAll();
        app.propertyResults = response;
        if(response.features.length){
            app.isSelectingProperties = false;
            if(response.features.length > 1){
                const headerLabels = {"Parcel Id":"parcel_id","Owner":"owner","Address":["mail_address1","mail_address2","mail_address3"]}
                var content = "<thead><tr>";
                $.each(headerLabels,function(key,value){
                    content += "<td><b>" + key + "</b></td>";
                });
                content += "</tr></thead><tbody>";

                response.features.forEach(function(feature) {
                    var grp = new Graphic(feature.geometry,symbol);
                    grpLayer.add(grp)
                    const attr = feature.attributes;
                    content += "<tr>";
                    $.each(headerLabels,function(key,value) {
                        if(Array.isArray(value)){
                            const vals = value.map( (f) => feature.attributes[f])
                            content += "<td>" + vals.join(",") + "</td>";
                        }else{
                            content += "<td>" + attr[value] + "</td>";
                        }
                    });
                    content += "</tr>";
                })

                content += "</tbody>"
                $("#property-info-table").html(content);
                $(".panel").addClass("collapse")
                $('#panelInfo').removeClass('collapse');
                $("#loading_spinner").hide();

            }else{
                var feature = response.features[0];
                var attrs = feature.attributes;
                var grp = new Graphic(feature.geometry,symbol);
                grpLayer.add(grp);
                
                var content = " <tbody>";
                response.fields.forEach(function (f){                
                    var fieldAlias = f.alias
                    content += "<tr><td><b>" + f.alias + ": </b></td><td>" + feature.attributes[f.name] + "</td></tr>";
                });
                
                content += "</tbody>";
                $("#property-info-table").html(content);
                $(".panel").addClass("collapse")
                $('#panelInfo').removeClass('collapse');
                $("#loading_spinner").hide();
            }
            
            
        }
    }

    function promiseRejected(e){
        $("#loading_spinner").hide();
        console.log(e)
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
        container: document.getElementById("tableDiv")
      });

      setTimeout(function(){
        $(".esri-feature-table__loader-container").html('<a role="button" onclick="toggleTablePanel()" ><span style="display:inline;color:black;font-size:24;font-weight:bold;margin-top:10px;" class="esri-icon-close"></span></a>');

      },2000)
      
      

    }





});

