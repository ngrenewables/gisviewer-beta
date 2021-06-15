var app = {
        zoom: 2,
        lonlat: [-40,0],
        view: null, 
        mapDiv: "mapViewDiv",
        streetViewActive:false,
        sketchViewModel:null
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
    "dojo/domReady!"
], function (WebMap, MapView, Home, Zoom, Compass, Search, Legend, BasemapToggle, ScaleBar, Attribution,Expand, Collapse, Dropdown, CalciteMaps, CalciteMapArcGISSupport, 
    esriConfig, Portal, OAuthInfo, esriId, Print,LayerList,WebTileLayer,GraphicsLayer) {


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

    /*const info = new OAuthInfo({
        // Swap this ID out with registered application ID
        appId: "ri3OXvyMneOGGobH",
        // Uncomment the next line and update if using your own portal
        //portalUrl: "https://lwweb01.geronimoenergy.local/portal",
        // Uncomment the next line to prevent the user's signed in state from being shared with other apps on the same domain with the same authNamespace value.
        // authNamespace: "portal_oauth_inline",
        popup: true
    });*/

    esriId.registerOAuthInfos([info]);

    esriId.getCredential(info.portalUrl + "/sharing");



    esriId.checkSignInStatus(info.portalUrl + "/sharing")
        .then(() => {
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

        
        // Popup and panel sync
        mapView.when(function (m) {
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

            initGSV();
        });

        mapView.on("click",function(e) {
            
            if(app.streetViewActive){
                window.open(`http://maps.google.com/maps?q=&layer=c&cbll=${e.mapPoint.latitude},${e.mapPoint.longitude}&cbp=11,0,0,0,0`);
                showGSV();
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

        var basemapToggle = new BasemapToggle({
            view: mapView,
            secondBasemap: "topo"
        });
        mapView.ui.add(basemapToggle, "top-left");

        var scaleBar = new ScaleBar({
            view: mapView
        });
        mapView.ui.add(scaleBar, "bottom-left");

        /*var attribution = new Attribution({
            view: mapView
        });
        mapView.ui.add(attribution, "manual");*/

        // Panel widgets - add legend
        const legend = new Expand({
            content: new Legend({
              view: mapView,
              style: "card" // other styles include 'classic'
            }),
            view: mapView,
            expanded: true
          });
        mapView.ui.add(legend, "bottom-right");

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





});

