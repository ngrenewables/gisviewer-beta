require([
    "esri/widgets/DistanceMeasurement2D",
    "esri/widgets/AreaMeasurement2D"


],function (DistanceMeasurement2D, AreaMeasurement2D){


    document.getElementById("distanceButton").addEventListener("click", function () {
        setActiveWidget(null);
        if (!this.classList.contains("active")) {
            setActiveWidget("distance");
        } else {
            setActiveButton(null);
        }
    });
    
    document.getElementById("areaButton").addEventListener("click", function () {
        setActiveWidget(null);
        if (!this.classList.contains("active")) {
            setActiveWidget("area");
        } else {
            setActiveButton(null);
        }
    });

    // Measurement 
function setActiveWidget(type) {
    switch (type) {
        case "distance":
            activeWidget = new DistanceMeasurement2D({
                view: app.view
            });

            // skip the initial 'new measurement' button
            activeWidget.viewModel.start();

            app.view.ui.add(activeWidget, "top-right");
            setActiveButton(document.getElementById("distanceButton"));
            break;
        case "area":
            activeWidget = new AreaMeasurement2D({
                view: app.view
            });

            // skip the initial 'new measurement' button
            activeWidget.viewModel.start();

            app.view.ui.add(activeWidget, "top-right");
            setActiveButton(document.getElementById("areaButton"));
            break;
        case null:
            if (activeWidget) {
                app.view.ui.remove(activeWidget);
                activeWidget.destroy();
                activeWidget = null;
            }
            break;
    }
}

function setActiveButton(selectedButton) {
    // focus the view to activate keyboard shortcuts for sketching
    app.view.focus();
    var elements = document.getElementsByClassName("active");
    for (var i = 0; i < elements.length; i++) {
        elements[i].classList.remove("active");
    }
    if (selectedButton) {
        selectedButton.classList.add("active");
    }
}

});

