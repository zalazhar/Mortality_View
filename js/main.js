
import 'babel-polyfill';
import world from './world';
import 'whatwg-fetch';
import 'co' ;

var co = require('co');

let Base = "https://public.opencpu.org/ocpu/library/base/R/";
let Stats = "https://public.opencpu.org/ocpu/library/stats/R/"; 
let Graphics = "https://public.opencpu.org/ocpu/library/graphics/R/"; 
var Riskmodel = 'https://public.opencpu.org/ocpu/github/zalazhar/Mortality/R/';

function form (json){
  return Object.keys(json).map(key=>encodeURIComponent(key)+'='+encodeURIComponent(json[key])).join('&');
};

function createRobject(Rlib, Rfunc, Rparams) {

 return fetch(Rlib + Rfunc, {
    method: 'post',
    headers: {
    'Accept': 'application/json, text/plain, */*',
    'Content-Type': 'application/x-www-form-urlencoded'
  },
    body: form((Rparams))
  })
};

function loadRobject(Location , type) {
   
   return fetch(Location).then (function (response){ return response.text()});

}


//initalization of document
document.addEventListener("DOMContentLoaded", function() {
  // Get dropdown element from DOM
  var dropdown = document.getElementById("selectNumber");
  for (var i = 0; i < 121 ; ++i){dropdown[dropdown.length] = new Option(i,i)};
  workflow(0,2184,10);
 
});

var dropdown = document.getElementById("selectNumber"); 
dropdown.addEventListener("change", function(){ 
  	workflow(dropdown.value,2184,10);
  });



function workflow (age,progYear,numberSims){

  co(function *(){
    
    // initialize views
    document.getElementById('plot_le').innerHTML =  "Please wait, loading graphs ..."
    document.getElementById('plot_le_time').innerHTML =  "Please wait, loading graphs ..."
    // generate the R objects:
  
    var stochasticSet = yield createRobject(Riskmodel,"loadSimData",{})  ;
    var expectedLife = yield createRobject(Riskmodel,"eex", {'listQx':stochasticSet.headers.get("X-ocpu-session"),"age":age});
    var rplot_exx = yield createRobject(Riskmodel,"histLifeExpectancy", {'eex':expectedLife.headers.get("X-ocpu-session")});
    var rplot_exx_time= yield createRobject(Riskmodel,"drawLifeExpectancyOverTime", {'startYear':2014,'endYear':2025,'age':age});
    var rquantile = yield createRobject(Riskmodel,"calculate_quantile",{"stochast":expectedLife.headers.get("X-ocpu-session")});
  
    // generate the views:
   // histogram
    document.getElementById('plot_le').innerHTML = "<img src ='" + rplot_exx.headers.get("Location") 
                                                    +  "/graphics/1/png?height=300&width=300'/>"
    document.getElementById('plot_le_time').innerHTML = "<img src ='" + rplot_exx_time.headers.get("Location") 
                                                     +  "/graphics/1/png?height=300&width=300'/>"
    document.getElementById('table_quantile').innerHTML = yield loadRobject(rquantile.headers.get("Location")+"R")
    document.getElementById('table_le').innerHTML =  yield loadRobject(expectedLife.headers.get("Location")+"R/.val")
    
  	
    
    }).catch(onerror);

}