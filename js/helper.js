/*function openNav() {
    
    document.getElementById("mySidebar").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
  }
  
function closeNav() {
    
    document.getElementById("mySidebar").style.width = "0";
    console.log(document.getElementById("mySidebar"));
    document.getElementById("main").style.marginLeft= "0";
}
*/



function togglePanel(panel){
    $(".panel").addClass("collapse")
    $(`#${panel}`).toggleClass('collapse');
}

function getURLParams(paramName){
    //var hash = window.location.hash.substr(1)
    console.log(location.hash)
    const queryString = window.location.search;
    
    const urlParams = new URLSearchParams(queryString);
    const paramValue = urlParams.get(paramName);
    return paramValue;
}

function getWebMapId(){
    var hashValue = location.hash.substr(1);
    if(hashValue) {
        return hashValue;
    }
}



// Feature Table Meathods

function clearTableSetup(){
    
    app.view.map.findLayerById("selection_graphic").removeAll();
    app.selectedFeatures = null;
    if(app.featureTable){
        app.featureTable.clearSelection();
        app.featureTable.destroy();
        app.featureTable = null;
        var tableDiv = document.createElement('div'); 
        tableDiv.setAttribute("id", "tableDiv");
        document.getElementById("tableContainer").appendChild(tableDiv);
    }
}

function toggleTablePanel(){
    if ($("#tableContainer").is(":visible")){
        $("#tableContainer").hide();
        $("#toggle-table").removeClass("esri-icon-down").addClass("esri-icon-up").html(" Show Table");
    }else{
        $("#tableContainer").show();
        $("#toggle-table").addClass("esri-icon-down").removeClass("esri-icon-up").html(" Hide Table");
    }
    
}

const selectButton = document.getElementById("select-by-rectangle");
// click event for the select by rectangle button
selectButton.addEventListener("click", () => {
    app.view.popup.close();
    app.sketchViewModel.create("rectangle");
});

document.getElementById("clear-selection").addEventListener("click", () => {
    if(app.featureTable){
        app.featureTable.clearSelection();
        app.view.map.findLayerById("selection_graphic").removeAll();
        app.selectedFeatures = null;
        app.featureTable.filterGeometry = null;
        app.featureTable.refresh();
    }
    
});


function selectLayerFeatures(queryGeometry) {
    if(!app.featureTable){
        return false
    }

    const selectLayer = app.featureTable.layer;
    const query = {
        geometry: queryGeometry,
        outFields: ["*"]
    };

    // query graphics from the csv layer view. Geometry set for the query
    // can be polygon for point features and only intersecting geometries are returned
    selectLayer.queryFeatures(query)
        .then((results) => {
          if (results.features.length === 0) {
            clearSelection();
          } else {
            app.selectedFeatures = results.features;
            // pass in the query results to the table by calling its selectRows method.
            // This will trigger FeatureTable's selection-change event
            // where we will be setting the feature effect on the csv layer view
            app.featureTable.filterGeometry = queryGeometry;
            app.featureTable.selectRows(results.features);
          }
        })
        .catch(errorCallback);

}

function errorCallback(error) {
    console.log("error happened:", error.message);
}


function addSelection(graphics){
    let symbol = {
        type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
        style: "square",
        color: "blue",
        size: "8px",  // pixels
        outline: {  // autocasts as new SimpleLineSymbol()
          color: [ 255, 255, 0 ],
          width: 3  // points
        }
      };

}


function configExportTOCSV(exportFeatures){
    const attrs = exportFeatures.map(a => a.attributes);
    const headers = {};
    const entry = attrs[0];
    for (let key in entry) {
      if (entry.hasOwnProperty(key)) {
        headers[key] = key;
      }
    }
    exportCSVFile(headers, attrs, "export");
}

function convertToCSV(objArray) {
    const array = typeof objArray != "object" ? JSON.parse(objArray) : objArray;
    let str = "";

    for (let i = 0; i < array.length; i++) {
      let line = "";
      for (let index in array[i]) {
        if (line != "") line += ",";

        line += array[i][index];
      }

      str += line + "\r\n";
    }

    return str;
}

function exportCSVFile(headers, items, fileTitle) {
    if (headers) {
       items.unshift(headers);
    }

    // Convert Object to JSON
    var jsonObject = JSON.stringify(items);

    const csv = convertToCSV(jsonObject);

    const exportedFilenmae = fileTitle + ".csv" || "export.csv";

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    if (navigator.msSaveBlob) {
        // IE 10+
        navigator.msSaveBlob(blob, exportedFilenmae);
    } else {
        const link = document.createElement("a");
        if (link.download !== undefined) {
            // feature detection
            // Browsers that support HTML5 download attribute
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", exportedFilenmae);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}


/*
(function($) {
    "use strict";
    var fullHeight = function() {
        $('.js-fullheight').css('height', $(window).height());
        $(window).resize(function() {
            $('.js-fullheight').css('height', $(window).height());
        });
    };
    fullHeight();
    $('#sidebarCollapse').on('click', function() {
        $('#sidebarMenu').toggleClass('active');
    });
})(jQuery);
*/