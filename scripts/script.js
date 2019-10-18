//*** GLOBAL VARIABLES***//
var map;
var dates = {highres: [], dates: []};
var values = {highres: [], max: [], mean: [], min: [], std_dev_range_lower: [], std_dev_range_upper: []};
var returnShapes;
var getWindowContent;
var actualLayer="Select Region";
var lastLayer="Select Region";
var actualTab="Forecast";
var method="ForecastEnsembles";


require([
"esri/map",
"esri/layers/ArcGISDynamicMapServiceLayer",
"dojo/on","dojo/ready",
"dijit/layout/TabContainer",
"dojo/dom-construct",
"dijit/layout/ContentPane",
"esri/dijit/InfoWindow",
"esri/InfoTemplate",
"esri/TimeExtent",
"esri/dijit/Legend",
"esri/dijit/TimeSlider",
"esri/InfoTemplate",
"esri/request",
"esri/config",
"dojo/_base/array",
"dojo/dom",
"dijit/registry",
"dojo/_base/connect",
"esri/dijit/Popup",
"esri/domUtils",
"esri/urlUtils",
"esri/geometry/Point",
"dojo/domReady!",
],

function (
  Map,
  ArcGISDynamicMapServiceLayer,
  on,
  ready,
  TabContainer,
  domConstruct,
  ContentPane,
  InfoWindow,
  InfoTemplate,
  TimeExtent,
  Legend,
  TimeSlider,
  InfoTemplate,
  esriRequest,
  esriConfig,
  arrayUtils,
  dom,
  connect,
  registry,
  Popup,
  domUtils,
  urlUtils,
  Point
)

{

  var loading = dom.byId("loadingImg");  //create loading image
  map = new Map("mapDiv", {
    center: [-13.49, 6.361],
    zoom: 3,
    basemap: "dark-gray"
  });
  showLoading;

  var infoWindow = new InfoWindow(null, domConstruct.create("div"));
  infoWindow.startup();
  map.infoWindow.resize(Math.min(800,screen.width),Math.min(750,screen.height));
  var infoTemplate = new InfoTemplate();
  infoTemplate.setContent(getWindowContent);



  // getWindowContent=function(graphic){
  function getWindowContent(graphic){
    infoTemplate.setTitle(graphic.attributes.watershed+" ("+graphic.attributes.subbasin+"): "+graphic.attributes.comid);
    var tc = new TabContainer({
      style: "min-height:33px;",// this makes the tabs visable
      // style: "min-width:2000px;"
    }, domConstruct.create("div"));

    // **Forecast Tab**//
    var cp1 = new ContentPane({
      title: "Forecast",
      content:getForecast(graphic)
    });
    //**Historical Tab**//
    var cp2 = new ContentPane({
      title: "Historical",
    });

    //**Seasonal Tab**//
    var cp3 = new ContentPane({
      title: "Seasonal Average",
    });


    tc.watch("selectedChildWidget", function(name, oldVal, newVal){
      if ( newVal.title === "Historical" ) {
        cp2.setContent(getHistoricData(graphic));
        actualTab="Historical";
      }
      else if (newVal.title === "Forecast"){
        cp1.setContent(getForecast(graphic));
        actualTab="Forecast";
      }
    else if (newVal.title === "Seasonal Average"){
        cp3.setContent(getSeasonalAverage(graphic));
        actualTab="Seasonal Average";
      }
    });

      tc.addChild(cp1);
      tc.addChild(cp2);
      tc.addChild(cp3);
      return tc.domNode;

  }

//***LAYERS**///

//**CENTRAL AMERICA**///
  var centralAmericaTemplate = {
     1: {
         infoTemplate: infoTemplate,
         layerUrl: "http://ai4e-arcserver.byu.edu/arcgis/rest/services/global/central_america/MapServer/1"
     }
  };

  var centralAmericaLyr = new ArcGISDynamicMapServiceLayer("http://ai4e-arcserver.byu.edu/arcgis/rest/services/global/central_america/MapServer",{
     infoTemplates: centralAmericaTemplate,
  });

//**AFRICA**//
  var africaTemplate = {
     1: {
         infoTemplate: infoTemplate,
         layerUrl: "http://ai4e-arcserver.byu.edu/arcgis/rest/services/global/africa/MapServer/1"
     }
  };

  var africaLyr = new ArcGISDynamicMapServiceLayer("http://ai4e-arcserver.byu.edu/arcgis/rest/services/global/africa/MapServer",{
     infoTemplates: africaTemplate,
  });

  //**SOUTH AMERICA**//
  var southAmericaTemplate = {
     1: {
         infoTemplate: infoTemplate,
         layerUrl: "http://ai4e-arcserver.byu.edu/arcgis/rest/services/global/south_america/MapServer/1"
     }
  };

  var southAmericaLyr = new ArcGISDynamicMapServiceLayer("http://ai4e-arcserver.byu.edu/arcgis/rest/services/global/south_america/MapServer",{
     infoTemplates: southAmericaTemplate,
  });

  //**SOUTH ASIA*//
  var southAsiaTemplate = {
      1: {
         infoTemplate: infoTemplate,
         layerUrl: "http://ai4e-arcserver.byu.edu/arcgis/rest/services/global/south_asia/MapServer/1"
     }
  };

  var southAsiaLyr = new ArcGISDynamicMapServiceLayer("http://ai4e-arcserver.byu.edu/arcgis/rest/services/global/south_asia/MapServer",{
     infoTemplates: southAsiaTemplate,
  });


   var layerDefinitions = [];
   centralAmericaLyr.setLayerDefinitions(layerDefinitions);
   southAmericaLyr.setLayerDefinitions(layerDefinitions);
   africaLyr.setLayerDefinitions(layerDefinitions);
   southAsiaLyr.setLayerDefinitions(layerDefinitions);
   // map.addLayers([southAsiaLyr, southAmericaLyr, africaLyr,centralAmericaLyr]);
   // map.addLayer(centralAmericaLyr);




  var loadLayers= $("#layersMenu");
  var point;
  loadLayers.change(function(e) {
    actualLayer=loadLayers.find(":selected").text();

   // switch (e.target.textContent) {
    console.log(lastLayer);
    console.log(actualLayer);
    switch (actualLayer) {
     case "Central America":
       map.removeAllLayers();
       map.destroy();
       loading = dom.byId("loadingImg");
       map = new Map("mapDiv", {
         center: [-95.29, 18.61],
         zoom: 5,
         basemap: "dark-gray"
       });
       showLoading;
       map.addLayer(centralAmericaLyr);
       lastLayer=actualLayer;
       break;
     case "South America":
       map.removeAllLayers();
       map.destroy();
       map = new Map("mapDiv", {
         center: [-59.24, -12.90],
         zoom: 4,
         basemap: "dark-gray"
       });
       showLoading;
       map.addLayer(southAmericaLyr);
       lastLayer=actualLayer;
       break;
     case "South Asia":
       map.removeAllLayers();
       map.destroy();
       map = new Map("mapDiv", {
         center: [78.6516, 24.1616],
         zoom: 5,
         basemap: "dark-gray"
       });
       showLoading;
       map.addLayer(southAsiaLyr);
       lastLayer=actualLayer;
       break;
     case "Africa":
       map.removeAllLayers();
       map.destroy();
       map = new Map("mapDiv", {
         center: [20.345, 7.9314],
         zoom: 4,
         basemap: "dark-gray"
       });
       showLoading;
       map.addLayer(africaLyr);
       lastLayer=actualLayer;
       break;
     case "Select Region":
      // map.removeLayer(queryLastLayerName(lastLayer));
      map.removeAllLayers();
      map.destroy();
      map = new Map("mapDiv", {
        center: [-13.49, 6.361],
        zoom: 3,
        basemap: "dark-gray"
      });
      showLoading;
      lastLayer=actualLayer;
      break;

   }
   // hide nav menu after selection on mobile
   if ($(".navbar-collapse.in").length > 0) {
     $(".navbar-toggle").click();
   }
 });


  map.on("load", function(evt){
    var legend = new Legend({
      map: map,
      layerInfos: [{
        layer: centralAmericaLyr,
        title: "Return Periods",
      }]
    }, "legendDiv");

    legend.startup();
  });//legend


       ///*** EVENTS FOR THE MAP****///
   on(map, "update-end", hideLoading);
   map.infoWindow.on('hide',function(graphic){
         // if ($('#graph').length) {
         //   Plotly.purge('graph');
         //   $('#graph').remove();
         // };
          var layerUrl= "http://aiforearth.azure-api.net/streamflow/HistoricSimulation?region=africa-continental&reach_id=131655";
          var method= "HistoricSimulation";
          var region= "africa-continental";
          var reachID="131655";
          $.ajax({
               type:'GET',
               // assync: true,
               url: 'query/',
               data:{
                 method:method,
                 region: region,
                 reachid: reachID
               },
               dataType: 'text',
               contentType:'text/plain',
               success: function(data) {
                 console.log('this is when we hide');
                 console.log('we have succeed');
                 // console.log(data);
                   if ($('#graph').length) {
                       Plotly.purge('graph');
                       $('#graph').remove();
                   };
               }
           })
       });// removes plot on close

   function decideMethodAPI(){
     switch (actualTab) {
      case "Forecast":
        method="ForecastEnsembles";
        return method;
        break;
      case "Historical":
        method="HistoricSimulation";
        return method;
        break;
      case "Seasonal Average":
        method="SeasonalAverage";
        return method;
        break;
      }
   };

   ///******* MAIN FUNCTIONS ******///////
   function getForecast(graphic) {
     console.log('WE HAVE ENTERED GETFORECAST FUNCTION()');
     var watershed=graphic.attributes.watershed;
     var subbasin = graphic.attributes.subbasin;
     var region=watershed+ "-" +subbasin;
     var reachid = graphic.attributes.comid;
     method=decideMethodAPI(method);
     // var method="ForecastEnsembles";
     console.log(method);
     console.log('printing region');
     console.log(region);
     console.log('printing reachID');
     console.log(reachid);
     var layer_URL="http://aiforearth.azure-api.net/streamflow/"+method+"?region="+region+"&reach_id="+reachid;
       $.ajax({
         type: 'GET',
         url: layer_URL,
         dataType: 'text',
         contentType: "text/plain",
         beforeSend: function(xhrObj){
         // Request headers
           xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key","67c316eb34854f9c94485d485df16787");
         },
         success: function(data) {
           console.log(watershed);
           console.log(subbasin);
           console.log(reachid);
           console.log("printing data from getForecast function");
           // console.log(data);

           if ($('#graph').length) {
             Plotly.purge('graph');
             $('#graph').remove();
           };

           $('div .contentPane').append('<div id="graph"></div>');
           var allLines = data.split('\n');
           var headers = allLines[0].split(',');

           for (var i=1; i < allLines.length; i++) {
             var data = allLines[i].split(',');

             if (headers.includes('high_res (m3/s)')) {
               dates.highres.push(data[0]);
               values.highres.push(data[1]);

               if (data[2] !== 'nan') {
                 dates.dates.push(data[0]);
                 values.max.push(data[2]);
                 values.mean.push(data[3]);
                 values.min.push(data[4]);
                 values.std_dev_range_lower.push(data[5]);
                 values.std_dev_range_upper.push(data[6]);
               }
             } else { //edited to show historic data
                 dates.dates.push(data[0]);
                 values.max.push(data[1]);
                 values.mean.push(data[2]);
                 values.min.push(data[3]);
                 values.std_dev_range_lower.push(data[4]);
                 values.std_dev_range_upper.push(data[5]);
               }
             }
           },
           complete: function() {
               var mean = {
                   name: 'Mean',
                   x: dates.dates,
                   y: values.mean,
                   mode: "lines",
                   line: {color: 'blue'}
               };

               var max = {
                   name: 'Max',
                   x: dates.dates,
                   y: values.max,
                   fill: 'tonexty',
                   mode: "lines",
                   line: {color: 'rgb(152, 251, 152)', width: 0}
               };

               var min = {
                   name: 'Min',
                   x: dates.dates,
                   y: values.min,
                   fill: 'none',
                   mode: "lines",
                   line: {color: 'rgb(152, 251, 152)'}
               };

               var std_dev_lower = {
                   name: 'Std. Dev. Lower',
                   x: dates.dates,
                   y: values.std_dev_range_lower,
                   fill: 'tonexty',
                   mode: "lines",
                   line: {color: 'rgb(152, 251, 152)', width: 0}
               };

               var std_dev_upper = {
                   name: 'Std. Dev. Upper',
                   x: dates.dates,
                   y: values.std_dev_range_upper,
                   fill: 'tonexty',
                   mode: "lines",
                   line: {color: 'rgb(152, 251, 152)', width: 0}
               };

               var data = [min, max, std_dev_lower, std_dev_upper, mean];

               if(values.highres.length > 0) {
                   var highres = {
                       name: 'HRES',
                       x: dates.highres,
                       y: values.highres,
                       mode: "lines",
                       line: {color: 'black'}
                   };

                   data.push(highres)
               }

               var layout = {
                   title:'Forecast<br>' + titleCase(watershed) + ' Reach ID: ' + reachid,
                   xaxis: {title: 'Date'},
                   yaxis: {title: 'Streamflow m3/s', range: [0, Math.max(...values.max) + Math.max(...values.max)/5]},
                   //shapes: returnShapes,
               }

               Plotly.newPlot('graph', data, layout);

               var index = dates.dates.length - 2;
               getreturnperiods(dates.dates[0], dates.dates[index], region, reachid);

               dates.highres = [], dates.dates = [];
               values.highres = [], values.max = [], values.mean = [], values.min = [], values.std_dev_range_lower = [], values.std_dev_range_upper = [];
           }//add lines to plotly

       });


   };


  // ///******* MAIN FUNCTIONS ******///////
  // function getForecast(graphic) {
  //   console.log('WE HAVE ENTERED GETFORECASTDATA FUNCTION()');
  //   var watershed=graphic.attributes.watershed;
  //   var subbasin = graphic.attributes.subbasin;
  //   var region=watershed+ "-" +subbasin;
  //   var reachid = graphic.attributes.comid;
  //   var method="ForecastEnsembles";
  //
  //   console.log('printing region');
  //   console.log(region);
  //   console.log('printing reachID');
  //   console.log(reachid);
  //
  //     $.ajax({
  //       type: 'GET',
  //       url: 'query/',
  //       data:{
  //         method:method,
  //         region: region,
  //         reachid: reachid
  //       },
  //       dataType: 'text',
  //       contentType: "text/plain",
  //
  //       success: function(data) {
  //         console.log(watershed);
  //         console.log(subbasin);
  //         console.log(reachid);
  //         console.log("printing data from getForecast function");
  //         // console.log(data);
  //
  //         if ($('#graph').length) {
  //           Plotly.purge('graph');
  //           $('#graph').remove();
  //         };
  //
  //         $('div .contentPane').append('<div id="graph"></div>');
  //         var allLines = data.split('\n');
  //         var headers = allLines[0].split(',');
  //
  //         for (var i=1; i < allLines.length; i++) {
  //           var data = allLines[i].split(',');
  //
  //           if (headers.includes('high_res (m3/s)')) {
  //             dates.highres.push(data[0]);
  //             values.highres.push(data[1]);
  //
  //             if (data[2] !== 'nan') {
  //               dates.dates.push(data[0]);
  //               values.max.push(data[2]);
  //               values.mean.push(data[3]);
  //               values.min.push(data[4]);
  //               values.std_dev_range_lower.push(data[5]);
  //               values.std_dev_range_upper.push(data[6]);
  //             }
  //           } else { //edited to show historic data
  //               dates.dates.push(data[0]);
  //               values.max.push(data[1]);
  //               values.mean.push(data[2]);
  //               values.min.push(data[3]);
  //               values.std_dev_range_lower.push(data[4]);
  //               values.std_dev_range_upper.push(data[5]);
  //             }
  //           }
  //         },
  //         complete: function() {
  //             var mean = {
  //                 name: 'Mean',
  //                 x: dates.dates,
  //                 y: values.mean,
  //                 mode: "lines",
  //                 line: {color: 'blue'}
  //             };
  //
  //             var max = {
  //                 name: 'Max',
  //                 x: dates.dates,
  //                 y: values.max,
  //                 fill: 'tonexty',
  //                 mode: "lines",
  //                 line: {color: 'rgb(152, 251, 152)', width: 0}
  //             };
  //
  //             var min = {
  //                 name: 'Min',
  //                 x: dates.dates,
  //                 y: values.min,
  //                 fill: 'none',
  //                 mode: "lines",
  //                 line: {color: 'rgb(152, 251, 152)'}
  //             };
  //
  //             var std_dev_lower = {
  //                 name: 'Std. Dev. Lower',
  //                 x: dates.dates,
  //                 y: values.std_dev_range_lower,
  //                 fill: 'tonexty',
  //                 mode: "lines",
  //                 line: {color: 'rgb(152, 251, 152)', width: 0}
  //             };
  //
  //             var std_dev_upper = {
  //                 name: 'Std. Dev. Upper',
  //                 x: dates.dates,
  //                 y: values.std_dev_range_upper,
  //                 fill: 'tonexty',
  //                 mode: "lines",
  //                 line: {color: 'rgb(152, 251, 152)', width: 0}
  //             };
  //
  //             var data = [min, max, std_dev_lower, std_dev_upper, mean];
  //
  //             if(values.highres.length > 0) {
  //                 var highres = {
  //                     name: 'HRES',
  //                     x: dates.highres,
  //                     y: values.highres,
  //                     mode: "lines",
  //                     line: {color: 'black'}
  //                 };
  //
  //                 data.push(highres)
  //             }
  //
  //             var layout = {
  //                 title:'Forecast<br>' + titleCase(watershed) + ' Reach ID: ' + reachid,
  //                 xaxis: {title: 'Date'},
  //                 yaxis: {title: 'Streamflow m3/s', range: [0, Math.max(...values.max) + Math.max(...values.max)/5]},
  //                 //shapes: returnShapes,
  //             }
  //
  //             Plotly.newPlot('graph', data, layout);
  //
  //             var index = dates.dates.length - 2;
  //             getreturnperiods(dates.dates[0], dates.dates[index], region, reachid);
  //
  //             dates.highres = [], dates.dates = [];
  //             values.highres = [], values.max = [], values.mean = [], values.min = [], values.std_dev_range_lower = [], values.std_dev_range_upper = [];
  //         }//add lines to plotly
  //
  //     });
  //
  //
  // };
  //*********SEASONAL AVERAGE FUNCTION TAB*******////
  function getSeasonalAverage(graphic) {
    console.log('WE HAVE ENTERED GET_SEASONAL_AVERAGE FUNCTION()');
    var watershed=graphic.attributes.watershed;
    var subbasin = graphic.attributes.subbasin;
    var region=watershed+ "-" +subbasin;
    var reachid = graphic.attributes.comid;
    method=decideMethodAPI(method);
    // var method="ForecastEnsembles";
    console.log(method);
    console.log('printing region');
    console.log(region);
    console.log('printing reachID');
    console.log(reachid);
    var layer_URL="http://aiforearth.azure-api.net/streamflow/"+method+"?region="+region+"&reach_id="+reachid;

    $.ajax({
      type:'GET',
      url: layer_URL,
      dataType: 'text',
      contentType:'text/plain',
      beforeSend: function(xhrObj){
      // Request headers
        xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key","67c316eb34854f9c94485d485df16787");
      },
      success: function(data) {
            console.log('we have succeed getting the seasonal average');
            console.log(data);

            if ($('#graph').length) {
                Plotly.purge('graph');
                $('#graph').remove();
            };


            $('div .contentPane').append('<div id="graph"></div>');

            var allLines = data.split('\n');
            var headers = allLines[0].split(',');

            for (var i=1; i < allLines.length; i++) {
              var data = allLines[i].split(',');
              dates.dates.push(data[0]);
              values.mean.push(data[1]);


            }
        },
        error: function(xhr, status, error){
          console.log("entering error");
          var errorMessage = xhr.status + ': ' + xhr.statusText;
          console.log(errorMessage);
          alert('Error - ' + errorMessage);
        },


        complete: function() {
            console.log("complete part of the ajax call for getSeasonalAverage");
            var mean = {
                name: 'Mean',
                x: dates.dates,
                y: values.mean,
                mode: "lines",
                line: {color: 'blue'}
            };

            var data = [mean];

            var layout = {
                // title: 'Historical Streamflow<br>'+titleCase(watershed) + ' Reach ID:' + comid,
                title: 'Seasonal Average StreamFlow<br>'+titleCase(watershed) + ' Reach ID:' + reachid,
                xaxis: {title: 'Days'},
                yaxis: {title: 'Streamflow m3/s', range: [0, Math.max(...values.max) + Math.max(...values.max)/5]},
                //shapes: returnShapes,
            }

            Plotly.newPlot('graph', data, layout);
            // Plotly.newPlot('graphs', data, layout);

            var index = dates.dates.length - 2;
            // getreturnperiods(dates.dates[0], dates.dates[index], watershed, subbasin, comid);
            console.log(dates.dates[0]);
            console.log(dates.dates[index]);
            console.log(region);
            console.log(reachid);
            getreturnperiods(dates.dates[0], dates.dates[index], region, reachid);


            dates.highres = [], dates.dates = [];
            values.highres = [], values.max = [], values.mean = [], values.min = [], values.std_dev_range_lower = [], values.std_dev_range_upper = [];
        }//add lines to plotly

    });

  };



  //*********SEASONAL AVERAGE FUNCTION TAB*******////
  // function getSeasonalAverage(graphic) {
  //   console.log('WE HAVE ENTERED GET_SEASONAL_AVERAGE FUNCTION()');
  //   var watershed=graphic.attributes.watershed;
  //   var subbasin = graphic.attributes.subbasin;
  //   var region=watershed+ "-" +subbasin;
  //   var reachid = graphic.attributes.comid;
  //   var method="SeasonalAverage";
  //   console.log('printing region');
  //   console.log(region);
  //   console.log('printing reachID');
  //   console.log(reachid);
  //
  //
  //   $.ajax({
  //     type:'GET',
  //     url: 'query/',
  //     data:{
  //       method:method,
  //       region: region,
  //       reachid: reachid
  //     },
  //     dataType: 'text',
  //     contentType:'text/plain',
  //     success: function(data) {
  //           console.log('we have succeed getting the seasonal average');
  //           console.log(data);
  //
  //           if ($('#graph').length) {
  //               Plotly.purge('graph');
  //               $('#graph').remove();
  //           };
  //
  //
  //           $('div .contentPane').append('<div id="graph"></div>');
  //
  //           var allLines = data.split('\n');
  //           var headers = allLines[0].split(',');
  //
  //           for (var i=1; i < allLines.length; i++) {
  //             var data = allLines[i].split(',');
  //             dates.dates.push(data[0]);
  //             values.mean.push(data[1]);
  //
  //
  //           }
  //       },
  //       error: function(xhr, status, error){
  //         console.log("entering error");
  //         var errorMessage = xhr.status + ': ' + xhr.statusText;
  //         console.log(errorMessage);
  //         alert('Error - ' + errorMessage);
  //       },
  //
  //
  //       complete: function() {
  //           console.log("complete part of the ajax call for getSeasonalAverage");
  //           var mean = {
  //               name: 'Mean',
  //               x: dates.dates,
  //               y: values.mean,
  //               mode: "lines",
  //               line: {color: 'blue'}
  //           };
  //
  //           var data = [mean];
  //
  //           var layout = {
  //               // title: 'Historical Streamflow<br>'+titleCase(watershed) + ' Reach ID:' + comid,
  //               title: 'Seasonal Average StreamFlow<br>'+titleCase(watershed) + ' Reach ID:' + reachid,
  //               xaxis: {title: 'Days'},
  //               yaxis: {title: 'Streamflow m3/s', range: [0, Math.max(...values.max) + Math.max(...values.max)/5]},
  //               //shapes: returnShapes,
  //           }
  //
  //           Plotly.newPlot('graph', data, layout);
  //           // Plotly.newPlot('graphs', data, layout);
  //
  //
  //           var index = dates.dates.length - 2;
  //           // getreturnperiods(dates.dates[0], dates.dates[index], watershed, subbasin, comid);
  //           console.log(dates.dates[0]);
  //           console.log(dates.dates[index]);
  //           console.log(region);
  //           console.log(reachid);
  //           getreturnperiods(dates.dates[0], dates.dates[index], region, reachid);
  //
  //
  //           dates.highres = [], dates.dates = [];
  //           values.highres = [], values.max = [], values.mean = [], values.min = [], values.std_dev_range_lower = [], values.std_dev_range_upper = [];
  //       }//add lines to plotly
  //
  //   });
  //
  // };


  //*********HISTORIC FUNCTION TAB*******////
  function getHistoricData(graphic) {
    console.log('WE HAVE ENTERED GETHISTORICDATA FUNCTION()');
    var watershed=graphic.attributes.watershed;
    var subbasin = graphic.attributes.subbasin;
    var region=watershed+ "-" +subbasin;
    var reachid = graphic.attributes.comid;
    // var method="ForecastEnsembles";
    //var method="HistoricSimulation";
    method=decideMethodAPI(method);
    console.log(method);
    console.log('printing region');
    console.log(region);
    console.log('printing reachID');
    console.log(reachid);
    var layer_URL="http://aiforearth.azure-api.net/streamflow/"+method+"?region="+region+"&reach_id="+reachid;
    $.ajax({
      type:'GET',
      // assync: true,
      url: layer_URL,
      dataType: 'text',
      contentType:'text/plain',
      beforeSend: function(xhrObj){
      // Request headers
        xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key","67c316eb34854f9c94485d485df16787");
      },
      success: function(data) {
            console.log('we have succeed gethistorical');
            // console.log(data);

            if ($('#graph').length) {
                Plotly.purge('graph');
                $('#graph').remove();
            };


            $('div .contentPane').append('<div id="graph"></div>');
            // $('div .contentPane').append($('#graphs'));

            var allLines = data.split('\n');
            var headers = allLines[0].split(',');

            for (var i=1; i < allLines.length; i++) {
                var data = allLines[i].split(',');

                if (headers.includes('high_res (m3/s)')) {

                    if (data[2] !== 'nan') {
                        dates.dates.push(data[0]);
                        values.mean.push(data[3]);
                    }
                } else {
                    dates.dates.push(data[0]);
                    values.mean.push(data[1]);

                }
            }
        },
        error: function(xhr, status, error){
          console.log("entering error");
          var errorMessage = xhr.status + ': ' + xhr.statusText;
          console.log(errorMessage);
          alert('Error - ' + errorMessage);
        },




        complete: function() {
            console.log("COMPLETE PART OF Streamflow()");
            var mean = {
                name: 'Mean',
                x: dates.dates,
                y: values.mean,
                mode: "lines",
                line: {color: 'blue'}
            };

            var data = [mean];

            var layout = {
                // title: 'Historical Streamflow<br>'+titleCase(watershed) + ' Reach ID:' + comid,
                title: 'Historical Streamflow<br>'+titleCase(watershed) + ' Reach ID:' + reachid,
                xaxis: {title: 'Date'},
                yaxis: {title: 'Streamflow m3/s', range: [0, Math.max(...values.max) + Math.max(...values.max)/5]},
                // plot_bgcolor:"#7782c5",

                //shapes: returnShapes,
            }

            Plotly.newPlot('graph', data, layout);
            // Plotly.newPlot('graphs', data, layout);


            var index = dates.dates.length - 2;
            // getreturnperiods(dates.dates[0], dates.dates[index], watershed, subbasin, comid);
            console.log(dates.dates[0]);
            console.log(dates.dates[index]);
            console.log(region);
            console.log(reachid);
            getreturnperiods(dates.dates[0], dates.dates[index], region, reachid);


            dates.highres = [], dates.dates = [];
            values.highres = [], values.max = [], values.mean = [], values.min = [], values.std_dev_range_lower = [], values.std_dev_range_upper = [];
        }//add lines to plotly

    });


  };


  // //*********HISTORIC FUNCTION TAB*******////
  // function getHistoricData(graphic) {
  //   console.log('WE HAVE ENTERED GETHISTORICDATA FUNCTION()');
  //   var watershed=graphic.attributes.watershed;
  //   var subbasin = graphic.attributes.subbasin;
  //   var region=watershed+ "-" +subbasin;
  //   var reachid = graphic.attributes.comid;
  //   var method="HistoricSimulation";
  //   console.log('printing region');
  //   console.log(region);
  //   console.log('printing reachID');
  //   console.log(reachid);
  //
  //   $.ajax({
  //     type:'GET',
  //     // assync: true,
  //     url: 'query/',
  //     data:{
  //       method:method,
  //       region: region,
  //       reachid: reachid
  //     },
  //     dataType: 'text',
  //     contentType:'text/plain',
  //     success: function(data) {
  //           console.log('we have succeed getstreamflow');
  //           // console.log(data);
  //
  //           if ($('#graph').length) {
  //               Plotly.purge('graph');
  //               $('#graph').remove();
  //           };
  //
  //
  //           $('div .contentPane').append('<div id="graph"></div>');
  //           // $('div .contentPane').append($('#graphs'));
  //
  //           var allLines = data.split('\n');
  //           var headers = allLines[0].split(',');
  //
  //           for (var i=1; i < allLines.length; i++) {
  //               var data = allLines[i].split(',');
  //
  //               if (headers.includes('high_res (m3/s)')) {
  //
  //                   if (data[2] !== 'nan') {
  //                       dates.dates.push(data[0]);
  //                       values.mean.push(data[3]);
  //                   }
  //               } else {
  //                   dates.dates.push(data[0]);
  //                   values.mean.push(data[1]);
  //
  //               }
  //           }
  //       },
  //       error: function(xhr, status, error){
  //         console.log("entering error");
  //         var errorMessage = xhr.status + ': ' + xhr.statusText;
  //         console.log(errorMessage);
  //         alert('Error - ' + errorMessage);
  //       },
  //
  //
  //
  //
  //       complete: function() {
  //           console.log("COMPLETE PART OF Streamflow()");
  //           var mean = {
  //               name: 'Mean',
  //               x: dates.dates,
  //               y: values.mean,
  //               mode: "lines",
  //               line: {color: 'blue'}
  //           };
  //
  //           var data = [mean];
  //
  //           var layout = {
  //               // title: 'Historical Streamflow<br>'+titleCase(watershed) + ' Reach ID:' + comid,
  //               title: 'Historical Streamflow<br>'+titleCase(watershed) + ' Reach ID:' + reachid,
  //               xaxis: {title: 'Date'},
  //               yaxis: {title: 'Streamflow m3/s', range: [0, Math.max(...values.max) + Math.max(...values.max)/5]},
  //               // plot_bgcolor:"#7782c5",
  //
  //               //shapes: returnShapes,
  //           }
  //
  //           Plotly.newPlot('graph', data, layout);
  //           // Plotly.newPlot('graphs', data, layout);
  //
  //
  //           var index = dates.dates.length - 2;
  //           // getreturnperiods(dates.dates[0], dates.dates[index], watershed, subbasin, comid);
  //           console.log(dates.dates[0]);
  //           console.log(dates.dates[index]);
  //           console.log(region);
  //           console.log(reachid);
  //           getreturnperiods(dates.dates[0], dates.dates[index], region, reachid);
  //
  //
  //           dates.highres = [], dates.dates = [];
  //           values.highres = [], values.max = [], values.mean = [], values.min = [], values.std_dev_range_lower = [], values.std_dev_range_upper = [];
  //       }//add lines to plotly
  //
  //   });
  //
  //
  // };

///*****RTURN PERIODS****/////
function getreturnperiods(start, end, region, reachid) {
  var layer_URL="http://aiforearth.azure-api.net/streamflow/ReturnPeriods"+"?region="+region+"&reach_id="+reachid;
  console.log("inside getreturnperiods");
    $.ajax({
      type:'GET',
      assync: true,
      url: layer_URL,
      dataType: 'text',
      contentType:'text/plain',
      beforeSend: function(xhrObj){
      // Request headers
        xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key","67c316eb34854f9c94485d485df16787");
      },
      success: function (data) {
        console.log("printing data");
        console.log(typeof(data));
        console.log(data);
        var returnPeriods = JSON.parse(data);
        console.log(returnPeriods);

        //RETURN PERIOD MAX
        var return_max = parseFloat(returnPeriods.time_series[0].val);
        console.log("printing Max");
        console.log(return_max);

        //RETURN PERIOD 20
        var return_20 = parseFloat(returnPeriods.time_series[1].val);
        console.log("printing return_20");
        console.log(return_20);

        //RETURN PERIOD 10
        var return_10 = parseFloat(returnPeriods.time_series[2].val);
        console.log("printing return10");
        console.log(return_10);

        //RETURN PERIOD 2
        var return_2 = parseFloat(returnPeriods.time_series[3].val);
        console.log("printing return2");
        console.log(return_2);
        var band_alt_max = -9999

        var shapes = [
                //return 20 band
                {
                  type: 'rect',
                  layer: 'below',
                  xref: 'x',
                  yref: 'y',
                  x0: start,
                  y0: return_20,
                  x1: end,
                  y1: Math.max(return_max, band_alt_max),
                  line: {width: 0},
                  fillcolor: 'rgba(128, 0, 128, 0.4)'
                },
                // return 10 band
                {
                    type: 'rect',
                    layer: 'below',
                    xref: 'x',
                    yref: 'y',
                    x0: start,
                    y0: return_10,
                    x1: end,
                    y1: return_20,
                    line: {width: 0},
                    fillcolor: 'rgba(255, 0, 0, 0.4)'
                },
                // return 2 band
                {
                    type: 'rect',
                    layer: 'below',
                    xref: 'x',
                    yref: 'y',
                    x0: start,
                    y0: return_2,
                    x1: end,
                    y1: return_10,
                    line: {width:0},
                    fillcolor: 'rgba(255, 255, 0, 0.4)'
                }];

          passShape(shapes);

        }
    })
};// create boxes for graph

// function getreturnperiods(start, end, region, reachid) {
//   console.log("inside getreturnperiods");
//     $.ajax({
//       type:'GET',
//       assync: true,
//       url: 'returnPeriods/',
//       data:{
//         region: region,
//         reachid: reachid
//       },
//       dataType: 'text',
//       contentType:'text/plain',
//       success: function (data) {
//         console.log("printing data");
//         console.log(typeof(data));
//         console.log(data);
//         var returnPeriods = JSON.parse(data);
//         console.log(returnPeriods);
//
//         //RETURN PERIOD MAX
//         var return_max = parseFloat(returnPeriods.time_series[0].val);
//         console.log("printing Max");
//         console.log(return_max);
//
//         //RETURN PERIOD 20
//         var return_20 = parseFloat(returnPeriods.time_series[1].val);
//         console.log("printing return_20");
//         console.log(return_20);
//
//         //RETURN PERIOD 10
//         var return_10 = parseFloat(returnPeriods.time_series[2].val);
//         console.log("printing return10");
//         console.log(return_10);
//
//         //RETURN PERIOD 2
//         var return_2 = parseFloat(returnPeriods.time_series[3].val);
//         console.log("printing return2");
//         console.log(return_2);
//         var band_alt_max = -9999
//
//         var shapes = [
//                 //return 20 band
//                 {
//                   type: 'rect',
//                   layer: 'below',
//                   xref: 'x',
//                   yref: 'y',
//                   x0: start,
//                   y0: return_20,
//                   x1: end,
//                   y1: Math.max(return_max, band_alt_max),
//                   line: {width: 0},
//                   fillcolor: 'rgba(128, 0, 128, 0.4)'
//                 },
//                 // return 10 band
//                 {
//                     type: 'rect',
//                     layer: 'below',
//                     xref: 'x',
//                     yref: 'y',
//                     x0: start,
//                     y0: return_10,
//                     x1: end,
//                     y1: return_20,
//                     line: {width: 0},
//                     fillcolor: 'rgba(255, 0, 0, 0.4)'
//                 },
//                 // return 2 band
//                 {
//                     type: 'rect',
//                     layer: 'below',
//                     xref: 'x',
//                     yref: 'y',
//                     x0: start,
//                     y0: return_2,
//                     x1: end,
//                     y1: return_10,
//                     line: {width:0},
//                     fillcolor: 'rgba(255, 255, 0, 0.4)'
//                 }];
//
//           passShape(shapes);
//
//         }
//     })
// };// create boxes for graph

function passShape(shapes) {
  console.log("Inside PassShape");
    var update = {
        shapes: shapes,
    };
    Plotly.relayout('graph', update);
}

function titleCase(str) {
    str = str.toLowerCase();
    str = str.split('_');

    for (var i = 0; i < str.length; i++) {
        str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
    }

    return str.join(' ');
};




  ///** ADDITIONAL FUNCTIONS****///
  //Loading function for gif loader at the beginning.
 function showLoading() {
    esri.show(loading);
    map.disableMapNavigation();
    map.hideZoomSlider();
  }
//Hide Function for gif loader at the end of loading the page.
function hideLoading(error) {
    esri.hide(loading);
    map.enableMapNavigation();
    map.showZoomSlider();
}

//***FUNCTION TO MAKE THE CHANGE OF LAYER EASIER**//
// for some reason is not working**//


// function rePositionMap(lat,long,layer,zoomLevel, baseMap){
//   map.removeAllLayers();
//   map.destroy();
//   loading = dom.byId("loadingImg");
//   map = new Map("mapDiv", {
//     center: [long, lat],
//     zoom: zoomLevel,
//     basemap: baseMap
//   });
//   showLoading;
//   map.addLayer(layer);
//   map.setVisibility(false);
//
// }



});
