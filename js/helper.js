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