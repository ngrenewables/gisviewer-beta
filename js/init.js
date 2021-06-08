var app;

require([
    // ArcGIS
    "esri/map",
    "esri/dijit/Search",
    "dojo/query",

    // Calcite Maps
    "calcite-maps/calcitemaps-v0.10",
    "esri/arcgis/Portal", "esri/arcgis/OAuthInfo", "esri/IdentityManager",
    "esri/urlUtils",
    "esri/arcgis/utils",
    "esri/dijit/LayerList",
    "esri/dijit/Print",
    "dojo/dom",
    // Bootstrap
    "bootstrap/Collapse",
    "bootstrap/Dropdown",
    "bootstrap/Tab",

    "dojo/domReady!"
], function (Map, Search, query, CalciteMaps, arcgisPortal, OAuthInfo, esriId,
    urlUtils,
    arcgisUtils, LayerList,Print, dom) {

    var info = new OAuthInfo({
        appId: "ZvN0DSivA9fHWHp1",
        // Uncomment the next line and update if using your own portal
        portalUrl: "https://lwweb01.geronimoenergy.local/portal/",
        // Uncomment the next line to prevent the user's signed in state from being shared
        // with other apps on the same domain with the same authNamespace value.
        //authNamespace: "portal_oauth_popup",
        popup: true
    });
    esriId.registerOAuthInfos([info]);

    esriId.getCredential(info.portalUrl + "/sharing", {
        oAuthPopupConfirmation: false
    }).then(function () {
        loadApp();
    }).otherwise(
        function (e) {
            console.log(e)
        }
    );



    function loadApp() {

        const mapId = getWebMapId();
        
        arcgisUtils.arcgisUrl = "https://lwweb01.geronimoenergy.local/portal/sharing/content/items";
        arcgisUtils.createMap(mapId, "mapViewDiv").then(function (response) {
            console.log(response);
            document.getElementById("mapTitle").innerHTML = response.itemInfo.item.title;
            var map = response.map;

            app = {
                map: null,
                basemap: "dark-gray",
                center: [-40, 40], // lon, lat
                zoom: 3,
                initialExtent: null,
                searchWidgetNav: null,
                searchWidgetPanel: null
            }

            app.map = map;
            console.log(arcgisUtils.getLayerList(response));


            var mapLayerList = new LayerList({
                map: response.map,
                showLegend: true,
                showSubLayers: true,
                showOpacitySlider: true,
                layers: arcgisUtils.getLayerList(response)
            }, "layerlistDiv");
            mapLayerList.startup();

            var printer = new Print({
                map: response.map,
                url: "http://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task"
              }, dom.byId("printButton"));

            app.map.on("load", function () {
                app.initialExtent = app.map.extent;


            });

            app.searchDivNav = createSearchWidget("searchNavDiv");
            app.searchWidgetPanel = createSearchWidget("searchPanelDiv");

            function createSearchWidget(parentId) {
                var search = new Search({
                    map: app.map,
                    enableHighlight: false
                }, parentId);
                search.startup();
                return search;
            }

            // Basemaps
            query("#selectBasemapPanel").on("change", function (e) {
                app.map.setBasemap(e.target.options[e.target.selectedIndex].value);
            });

            // Home
            query(".calcite-navbar .navbar-brand").on("click", function (e) {
                app.map.setExtent(app.initialExtent);
            })


        });



    }


});