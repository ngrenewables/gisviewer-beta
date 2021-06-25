var introguide = introJs();
function initTour(){    
    introguide.setOptions({
        skipLabel: 'Skip Tour',
        steps: [{
          title: 'Take a Tour !!  👋',
          intro: '<b>Welcone to National Grid Renewable - Geo Data Viewer !! </b>',
          
        },
        
        {
          title: 'View Map Layers',
          intro:'View and Toggle Map Layers',
          element: document.querySelector('.glyphicon.glyphicon-list').parentElement,
          simulateClick: document.querySelector('.glyphicon.glyphicon-list'),
          position:'bottom',
          onchange: function() {
            $( ".panel.collapse" ).css("margin-top","150px");
            $( ".glyphicon.glyphicon-list" ).trigger( "click" );
            
          },
        },
        {
          title: 'View Data Table ',
          element: document.querySelector('.glyphicon.glyphicon-filter').parentElement,
          intro: 'View & Export Tabular Data for any Map Layer',
          position:'bottom',
          onchange: function() {
            $( ".glyphicon.glyphicon-filter" ).trigger( "click" );
            $('#selectLayer option:eq(1)').attr('selected', 'selected');
            $('#selectLayer').trigger('change');
          },
        },
        {
            title: 'Select Features',
            element: document.getElementById('select-by-rectangle'),
            intro: 'Select features on map (drag rectangle) and filter table data',
            position:'bottom',
        },
        {
            title: 'Clear Selection',
            element: document.getElementById('clear-selection'),
            intro: 'Clear map selection and table data ',
            position:'bottom',            
        },
        {
            title: 'Export Table to CSV',
            intro: 'Export Table data to CSV',
            element: document.getElementById('tableDiv'),
            position:'right',
            onchange: function() {
                //$('.esri-icon-menu').trigger('click');
            }
        },
        {
            title: 'Print Map',
            element: document.querySelector('.glyphicon.glyphicon-print').parentElement,
            intro: 'Print Map layouts various in different formats',
            position:'bottom',
            onchange: function() {
              $('#selectLayer option:eq(0)').attr('selected', 'selected');
              $('#selectLayer').trigger('change');
              clearTableSetup();
              $("#tableContainer").hide();
              $( ".glyphicon.glyphicon-print" ).trigger( "click" );
            },
          },
          {
            title: 'Measure Area or Length',
            intro: 'Measure Area or Length by selecting draw type',
            element: document.getElementById('topbar'),
            position:'right',
            onchange: function() {
                $('#panelPrint').hide();
            }
          },
          {
            title: 'Google Street View',
            intro: 'Click on Map to View Google Street View for the clicked location',
            element: document.getElementById('streetViewIcon'),
            position:'right',
            onchange: function() { 
                console.log(app.view.ui)            
                app.view.scale = 120000;
                $("#streetIcon").trigger("click");
            }
          },
          {
            title: 'Legend',
            intro:'View Layer Classification and Symbols',
            element: document.querySelector('.esri-expand--auto'),
            position:'bottom',
            onchange: function() {   
                $("#streetIcon").trigger("click");           
                app.view.ui._components[1].widget.go();
                $(".esri-expand--auto").trigger("click");
                app.view.ui._components[4].widget.expand();
            }
          }
          
    ]
    }).start().oncomplete(function (){
        app.view.ui._components[4].widget.collapse();
        $( ".panel.collapse" ).css("margin-top","50px");
        $( "#panelLayers" ).removeClass("collapse"); 
    }).onexit(function (){
         $( ".panel.collapse" ).css("margin-top","50px");
         $( "#panelLayers" ).removeClass("collapse"); 
    }).onskip(function (){
      $( ".panel.collapse" ).css("margin-top","50px");
      $( "#panelLayers" ).removeClass("collapse"); 
    });

}


function createStepEvents(guideObject, eventList) {

    //underscore loop used here.
    eventList.forEach(function(event) {
  
      //for the guid object's <event> attribute.
      guideObject[event](function() {
  
        //get its steps and current step value
        var steps = this._options.steps,
        currentStep = this._currentStep;
        if(typeof steps[currentStep][event] === 'function'){
           //if it's a function, execute the specified <event> type
           //if (_.isFunction(steps[currentStep][event])) {
          steps[currentStep][event]();
        }
      });
  
    }, this);
  }
  
  //setup the events per step you care about for this guide
  createStepEvents(introguide, ['onchange', 'onbeforechange']);