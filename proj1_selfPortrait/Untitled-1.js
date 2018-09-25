//Map Setupdetails
mapboxgl.accessToken = 'pk.eyJ1IjoibnljZG90IiwiYSI6IlhHQjNQRWMifQ.cz7P1kLgUTLOlt9Lc1RQvQ';
var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/streets-v8', //stylesheet location
  center: [-73.8, 40.65], // starting position
  zoom: 9 // starting zoom
});
//On Load find my position get coordinates
map.on('load', function() {
  geolocate();
});
//Adds a cursor of pointer on hover.
map.on('mousemove', function(e) {
  var markers = map.queryRenderedFeatures(e.point, {
    layers: ['geomarker']
  });
  map.getCanvas().style.cursor = (markers.length) ? 'pointer' : '';
});
//Fly to and center on geolocation marker
map.on('click', function(e) {
  //variables for each marker and its properties
  var geomarkers = map.queryRenderedFeatures(e.point, {
    layers: ['geomarker']
  });
  if (geomarkers.length) {
    map.flyTo({
      center: geomarkers[0].geometry.coordinates
    });
  }
});
//Pass coordinates from html geolocation to the next function.
function geolocate() {
  this.gl = !this.gl;
  if (this.gl == true) {
    var startPos;
    var geoOptions = {
      timeout: 10 * 1000
    }

    var geoSuccess = function(position) {
      startPos = position;
      var radius = 20;
      map.flyTo({
        center: [startPos.coords.longitude, startPos.coords.latitude],
        zoom: 14,
        bearing: 0,
      });
      map.addSource("geomarker", {
        "type": "geojson",
        "data": {
          "type": "FeatureCollection",
          "features": [{
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [startPos.coords.longitude, startPos.coords.latitude]
            },
            "properties": {
              "title": "You Found Me",
            }
          }]
        }
      });
      map.addLayer({
        "id": "geomarker",
        "type": "circle",
        "source": "geomarker",
        "source-layer": "geomarker",
        "paint": {
          "circle-radius": radius,
          "circle-color": "#3BBB87",
          "circle-opacity": 0.8,
        }
      });

      map.addSource("Minute10", {
        "type": "geojson",
        "data": {
          "type": "FeatureCollection",
          "features": [{

            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [startPos.coords.longitude - 0.0086736, startPos.coords.latitude]
            },
            "properties": {
              "title": "10 Minutes",
            }
          }]
        }
      });
      map.addLayer({
        "id": "Minute10",
        "type": "symbol",
        "source": "Minute10",
        "source-layer": "Minute10",
        "layout": {
          "visibility": "visible",
          "icon-image": "metro-demo",
          "icon-size": 2,
          "text-field": "{title}",
          "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
          "text-offset": [0, 0.6],
          "text-anchor": "top"
        }
      });

      // D3 will insert a svg into the map container
      var container = map.getCanvasContainer();
      //console.log(container);
      var svg = d3.select(container).append("svg").attr("id", "geoCircle");
      //An array with the coordinates of the geomarker
      var geolocate = [{
        "lon": startPos.coords.longitude,
        "lat": startPos.coords.latitude
      }];

      //convience function for projecting geolocation coordinates
      function project(d) {
        return map.project(getLL(d));
      }
      //convience function for adding projected coordinates to mapbox canvas
      function getLL(d) {
        return new mapboxgl.LngLat(+d.lon, +d.lat)
      }

      //setup and append our svg with a circle tag and a class of dot
      var dots = svg.selectAll("circle.dot").data(geolocate);
      console.log(dots);
      dots.enter().append("circle").classed("dot", true)
        .style({
          "fill": "#FFF",
          "fill-opacity": 0,
          "stroke": "#000",
          "stroke-width": 4,
          "stroke-dasharray": [2, 2],
          "cursor": "pointer",
          "pointer-events": "none"
        });

      map.on("viewreset", function(e) {
        var zoom = map.getZoom(e)
        var bear = map.getBearing(e);
        var p1 = [startPos.coords.longitude, startPos.coords.latitude];
        //0.0086736 is roughly equal to 731.52 meters
        var p2 = [startPos.coords.longitude + 0.0086736, startPos.coords.latitude];
        var a = map.project(p1);
        var b = map.project(p2);
        var radius = (b.x - a.x);
        dots.attr("r", radius).transition();
        dots.attr({

          cx: function(d) {
            var x = project(d).x;
            return x
            console.log(x);
          },
          cy: function(d) {
            var y = project(d).y;
            return y
            console.log(y);
          }
        })
      });

      map.on("move", function(e) {
        //render();
        var zoom = map.getZoom(e)
        var bear = map.getBearing(e);
        var p1 = [startPos.coords.longitude, startPos.coords.latitude];
        //0.0086736 is roughly equal to 731.52 meters
        var p2 = [startPos.coords.longitude + 0.0086736, startPos.coords.latitude];
        var a = map.project(p1);
        var b = map.project(p2);
        var radius = (b.x - a.x);
        dots.attr("r", radius).transition();
        dots.attr({
          cx: function(d) {
            var x = project(d).x;
            return x
          },
          cy: function(d) {
            var y = project(d).y;
            return y
          }
        })
      });

      map.on("zoomend", function(e) {
        //render();
        var zoom = map.getZoom(e)
        var bear = map.getBearing(e);
        var p1 = [startPos.coords.longitude, startPos.coords.latitude];
        //0.0086736 is roughly equal to 731.52 meters
        var p2 = [startPos.coords.longitude + 0.0086736, startPos.coords.latitude];
        var a = map.project(p1);
        var b = map.project(p2);
        var radius = (b.x - a.x);
        dots.attr("r", radius).transition();
        dots.attr({
          cx: function(d) {
            var x = project(d).x;
            return x
          },
          cy: function(d) {
            var y = project(d).y;
            return y
          }
        })
      });

    };

    var geoError = function(error) {
      console.log('Error occurred. Error code: ' + error.code);
    };

    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();

    navigator.geolocation.getCurrentPosition(geoSuccess, geoError, geoOptions);
  } else {
    map.removeSource("geomarker");
    map.removeLayer("geomarker");
    map.removeSource("Minute10");
    map.removeLayer("Minute10");
    map.dragRotate.enable();
    map.touchZoomRotate.enableRotation();
    d3.select("#geoCircle").remove();
  }
}