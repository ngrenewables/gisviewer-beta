var app = {
        zoom: 2,
        lonlat: [-40,0],
        view: null, 
        mapDiv: "mapViewDiv"
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
    "dojo/domReady!"
], function (WebMap, MapView, Home, Zoom, Compass, Search, Legend, BasemapToggle, ScaleBar, Attribution, Collapse, Dropdown, CalciteMaps, CalciteMapArcGISSupport, 
    esriConfig, Portal, OAuthInfo, esriId, Print,LayerList) {


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
            
            var print = new Print({
                view: mapView,
                // specify your own print service
                printServiceUrl: "https://lwweb01.geronimoenergy.local/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task",
                container:"printDiv"
              });

              var layerList = new LayerList({
                view: mapView,
                container:"layersDiv"
              });

            CalciteMapArcGISSupport.setPopupPanelSync(mapView);
        });

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
            secondBasemap: "satellite"
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
        var legendWidget = new Legend({
            view: mapView
        });

        mapView.ui.add(legendWidget,"bottom-right")

        mapView.ui.add("topbar", "top-right");

        

        

    }





});

