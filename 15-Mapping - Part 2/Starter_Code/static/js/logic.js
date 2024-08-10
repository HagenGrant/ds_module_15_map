// Radius Function
function markerSize(mag) {
    let radius = 1;
    if (mag > 0) {
      radius = mag ** 7;
    }
    return radius
  }
  
  // Earthquake depth function
  function chooseColor(depth) {
    let color = "grey";
  
    // Depth determines the color
    if (depth <= 10) {
      color = "#85ff7a";
    } else if (depth <= 30) {
      color = "#ccff00";
    } else if (depth <= 50) {
      color = "#ffde21";
    } else if (depth <= 70) {
      color = "#ff7c43";
    } else if (depth <= 90) {
      color = "#ff4b33";
    } else {
      color = "#d20a2e";
    }
  
    // return color based on depth
    return (color);
  }
  //Function to create the map
  function createMap(data, geo_data) {
  
    // Define variables for our tile layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
  
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
  
    // Create the overlay layer for circles
    let heatArray = [];
    let circleArray = [];
  
    for (let i = 0; i < data.length; i++){
      let row = data[i];
      let location = row.geometry;
  
      // Create marker
      if (location) {
        // Extract coord
        let point = [location.coordinates[1], location.coordinates[0]];
  
        // Make marker
        let marker = L.marker(point);
        let popup = `<h1>${row.properties.title}</h1>`;
        marker.bindPopup(popup);

       // Add to heatmap
      heatArray.push(point);
  
        // Create and define circle marker
        let circleMarker = L.circle(point, {
          fillOpacity: 0.75,
          color: chooseColor(location.coordinates[2]),
          fillColor: chooseColor(location.coordinates[2]),
          radius: markerSize(row.properties.mag)
        }).bindPopup(popup);
        circleArray.push(circleMarker);
      }
    }
    // Create layer
    let heatLayer = L.heatLayer(heatArray, {
      radius: 75,
      blur: 10
    });
    // Create the circle layer
    let circleLayer = L.layerGroup(circleArray);

    // Tectonic plate layer
    let geo_layer = L.geoJSON(geo_data, {
      style: {
        "color": "#e56520",
        "weight": 5
    }
  });
  
    // Only one base layer can be shown at a time.
    let baseLayers = {
      Street: street,
      Topography: topo
    };
  
    let overlayLayers = {
      Circles: circleLayer,
      Heatmap: heatLayer,
      "Tectonic Plates": geo_layer
    }
  
    // Init the Map
    let myMap = L.map("map", {
      center: [30, -75],
      zoom: 3,
      layers: [street, circleLayer, geo_layer]
    });
    L.control.layers(baseLayers, overlayLayers).addTo(myMap);
    // Create the legend
    let legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
      let div = L.DomUtil.create("div", "info legend");
  
      let legendInfo = "<h4>Earthquake Depth</h4>"
      legendInfo += "<i style='background: #85ff7a'></i>-10-10<br/>";
      legendInfo += "<i style='background: #ccff00'></i>10-30<br/>";
      legendInfo += "<i style='background: #ffde21'></i>30-50<br/>";
      legendInfo += "<i style='background: #ff7c43'></i>50-70<br/>";
      legendInfo += "<i style='background: #ff4b33'></i>70-90<br/>";
      legendInfo += "<i style='background: #d20a2e'></i>90+";
  
      div.innerHTML = legendInfo;
      return div;
    };
  
    // Adding the legend to the map
    legend.addTo(myMap);
  }
  
  function doWork() {

    // Assemble the API query URL.
    let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson";
    let url2 = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
  
    d3.json(url).then(function (data) {
      // console.log(data);
      d3.json(url2).then(function (geo_data) {
        let data_rows = data.features;
  
        // make map with both datasets
        createMap(data_rows, geo_data);
      });
    });
  }

  
doWork();
  