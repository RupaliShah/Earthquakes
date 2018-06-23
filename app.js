access_token = 'access_token=pk.eyJ1IjoicnVwYWxpMjgiLCJhIjoiY2podHc3cnFoMGlieTNwanhmZDJxcXdubSJ9.nZwyErnT_qW1hIIAE7zaLg';
var outdoorMap = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?' + access_token);
var satelliteMap = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?' + access_token);
var lightMap = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v8/tiles/256/{z}/{x}/{y}?' + access_token);
var earthquake_url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';
var tectonicPlates_url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// var myMap = L.map('mapid').setView([48.1667, -100.1667], 13);
// Add a tile layer
// L.tileLayer(outdoorMap).addTo(myMap);

//API call to get earthgquake data 
//send data.features object to createFeatures function
d3.json(earthquake_url, function(data){
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {       
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJson(earthquakeData, {

    onEachFeature: function (feature, layer){
      layer.bindPopup("<h3>" + feature.properties.place + "<br><h3>" + new Date(feature.properties.time) +
      "<br><h3> Magnitude: " + feature.properties.mag);
    },
    pointToLayer: function (feature, latlng) {
      return new L.circleMarker(latlng, {
        radius: getRadius(feature.properties.mag),
        fillColor: getColor(feature.properties.mag),
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    });
    } 
  })
  createMap(earthquakes);
};

// Create map,layers,legend

function createMap(earthquakes){

  // Add a fault Lines layer
  var faultLines = new L.LayerGroup();

  // Add Fault lines data
  d3.json(tectonicPlates_url, function(data) {
    L.geoJson(data, {
      color: "orange",
      weight: 2
    }).addTo(faultLines);
  });
  
  // Create baseMaps object to hold base layers
  var baseMaps = {
    "Satellite": satelliteMap,
    "Light": lightMap,
    "Outdoors": outdoorMap,
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Fault Lines": faultLines
  };

  var myMap = L.map("mapid", {
  //center: [37.09, -95.71],
  center:[48.1667, -100.1667],
  zoom: 3,
  layers : [outdoorMap, earthquakes, faultLines]
  });

  //Create layer control
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);


  var legend = L.control({position: 'bottomright'});
    legend.onAdd = function (myMap) {

    var div = L.DomUtil.create('div', 'info legend');
    labels = [],
    categories = [0, 1, 2, 3, 4, 5];

    for (var i = 0; i < categories.length; i++) {
            labels.push(
                '<i style="background:' + getColor(categories[i]+1) + '"></i> ' +      
           (categories[i] + '-' + (categories[i]+1)) );
        }
        div.innerHTML = labels.join('<br>');
        return div;
    };
    legend.addTo(myMap);
  };

//Change the magnitude of the earthquake by a factor of 3 for the radius of the circle. 
function getRadius(value){
  return value * 3;
};

function getColor(color){
  return color > 5 ? '#F30' :
  color > 4  ? '#F60' :
  color > 3  ? '#F90' :
  color > 2  ? '#FC0' :
  color > 1  ? '#FF0' :
              '#6F0';
}



   