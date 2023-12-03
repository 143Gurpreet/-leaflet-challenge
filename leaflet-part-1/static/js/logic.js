
  // Add a tile layer to the map
// Define the satellite layer using Esri's World Imagery service
let satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles © Esri &mdash; Source: Esri, Maxar, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'
});

// Define the grayscale layer
let grayscale = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
  attribution: '© CartoDB contributors'
});

// Define the outdoors layer using OpenTopoMap
let outdoors = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data © OpenTopoMap contributors'
});

  // Initialize the map
  let myMap = L.map("map", {
    center: [40.7128, -74.0059], // initial map center
    zoom: 5, // initial zoom level
    layers: [satellite,grayscale, outdoors] // default base laye it could usually only one base layer is visible at a timer
  });
  
  
 // Define baseMaps for layer control
 // It's used to create a control that allows users to switch between different map styles.
let baseMaps = {
    "Satellite":satellite,
    "Grayscale":grayscale,
    "outdoors":outdoors
  };


  // Define overlayMaps for layer control (currently empty)
  //this object is intended for overlay layers (like earthquake data) that can be toggled on and off.
let overlayMaps = {};
  

 // Add layer control to the map
 // This control lets users switch between the base layers and toggle any overlays.
 
L.control.layers(baseMaps, overlayMaps).addTo(myMap);


  
  
  // Function to determine marker size based on earthquake magnitude
  function markerSize(magnitude) {
    return magnitude * 20000;
  }
  
  // Function to determine marker color based on earthquake depth
  function markerColor(depth) {
    return depth > 90 ? "#ff3333" :
           depth > 70 ? "#ff6633" :
           depth > 50 ? "#ff9933" :
           depth > 30 ? "#ffcc33" :
           depth > 10 ? "#ffff33" :
                        "#ccff33";
  }

  // link to get the json data 
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

  // Load the GeoJSON data
  //Uses D3.js to load earthquake data from the USGS in GeoJSON format. 
  //The then part is a promise that processes the data once it's loaded.
  d3.json(url).then(function(data) {
    // Create a GeoJSON layer containing the features array
    L.geoJSON(data.features, {
      // Create each feature as a circle marker
      pointToLayer: function(feature, latlng) {
        return L.circle(latlng, {
          radius: markerSize(feature.properties.mag),
          fillColor: markerColor(feature.geometry.coordinates[2]),
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        });
      },
      // Create popups
      onEachFeature: function(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]} km</p>`);
      }
    }).addTo(myMap);
  
    // Create a legend and add it to the map
    let legend = L.control({position: 'bottomright'});
  
    legend.onAdd = function (map) {
      let div = L.DomUtil.create('div', 'info legend'),
      depthRanges = [-10, 10, 30, 50, 70, 90], // Define depthRanges here
          labels = [];
  
     // Loop through depth ranges and generate a label with a colored square for each range
  for (let i = 0; i < depthRanges.length; i++) {
    let from = depthRanges[i];
    let to = depthRanges[i + 1];

    // Use markerColor function to get the color for the current range
    let color = markerColor(from + 1);

    labels.push(
      '<i style="background:' + color + '; width: 18px; height: 18px; border-radius: 50%; display: inline-block; margin-right: 5px;"></i> ' +
      from + (to ? '&ndash;' + to + ' km' : '+ km'));
  }

  div.innerHTML = labels.join('<br>');
  return div;
};
  
    legend.addTo(myMap);
}); 