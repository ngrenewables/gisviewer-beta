

function renderQueryResults(response,Graphic){
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
    //grpLayer.removeAll();
    //app.propertyResults = response;
    if(response.features.length){
        if(Array.isArray(app.propertyResults)){
            app.propertyResults = app.propertyResults.concat(response.features)
        }else{
            app.propertyResults = response.features
        }
        
        app.isSelectingProperties = false;
        if(app.propertyResults.length > 1){
            const headerLabels = {"Owner":"owner","Mail Address":["mailadd","mail_city","mail_state2","mail_zip"],"Prop. Area (Acres)":"ll_gisacre"}
            var content = "<thead><tr>";
            $.each(headerLabels,function(key,value){
                content += "<td><b>" + key + "</b></td>";
            });
            content += "</tr></thead><tbody>";

            app.propertyResults.forEach(function(feature) {
                var grp = new Graphic(feature.geometry,symbol);
                grpLayer.add(grp)
                const attr = feature.attributes;
                content += "<tr>";
                $.each(headerLabels,function(key,value) {
                    if(Array.isArray(value)){
                        const vals = value.map( (f) => feature.attributes[f])
                        content += "<td>" + vals[0]  + " <br/>" + vals[1] + " <br />" + vals[2]  + "," + vals[3] + "</td>";
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
            console.log(grp)
            var content = " <tbody>";
            response.fields.forEach(function (f){                
                var fieldAlias = f.alias;
                if(feature.attributes[f.name]) {
                    content += "<tr><td><b>" + f.alias + ": </b></td><td>" + feature.attributes[f.name] + "</td></tr>";
                }
                
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



// Property Info Methods

const selectButtonParcel = document.getElementById("select-by-rectangle-parcel");
// click event for the select by rectangle button
selectButtonParcel.addEventListener("click", () => {
    app.isSelectingProperties = true;
    app.view.popup.close();
    app.sketchViewModel.create("circle");
});


function clearPropertyData(){
    app.propertyResults = null;
    app.isSelectingProperties = false;
    const grpLayer = app.view.map.findLayerById("selection_graphic");
    grpLayer.removeAll();
    $("#property-info-table").html("");
}


function downloadPropertyData(){
    if(app.propertyResults.length){
        
        configExportTOCSV(app.propertyResults);
    }
}


