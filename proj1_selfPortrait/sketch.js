mapboxgl.accessToken = 'pk.eyJ1IjoicG9uZGphbWVzMDA3IiwiYSI6ImNqOW9wbDJ1NTFlaWcyd240b3IzbzBzMGcifQ.5kemTIDRSd4D7kIp5Oofww';

let options = { //map options
    container: "map",
    center: [-73.861351, 40.729690],//[-73.89752, 40.71427],
    zoom: 4,
    //pitch: 45,
    //bearing: -17.6,
    style: 'mapbox://styles/mapbox/dark-v9'
  
  }

let healthData;
let cumPixels;
let cumDistance;
let ratio;

d3.csv('Health_Data.csv')
  .then(data => {
    
    healthData = data.map(d => {
        return {
            date: d.Start.split(' ')[0].slice(3),
            distance: d.Distance * 1.6,
            pixels: metersToPixelsAtMaxZoom(d.Distance * 1.6 * 1000, options.center[1]), 
            steps: Math.floor(d.Steps)
        }
        
    });
    // console.log(healthData)
  })
  .then(() => {
    cumPixels = healthData.map(d => d.pixels).reduce((r, a)=>{
        if(r.length > 0)
            a += r[r.length - 1]
        r.push(a)
        return r
    }, [])

    cumDistance = healthData.map(d => d.distance).reduce((r, a)=>{
        if(r.length > 0)
            a += r[r.length - 1]
        r.push(a)
        return r
    }, [])

    ratio = healthData.map(d => d.pixels/d.steps || 1)
    console.log(ratio)
  })
  .catch(e =>{
    console.log(e)
  })


  



function metersToPixelsAtMaxZoom(meters, latitude){
    return Math.round(meters / 0.075 / Math.cos(latitude * Math.PI / 180))
}
  

let map = new mapboxgl.Map(options);

map.on('load', () => {
    let maxRad = 1;
    let i = 0;
    let radius = {
        stops: [
          [0, 0],
          [20, 1]
        ],
        base: 2
    };
    map.addLayer({
          "id": "points-30",
          "type": "circle",
          "source": {
              "type": "geojson",
              "data": {
                  "type": "FeatureCollection",
                  "features": [{
                      "type": "Feature",
                      "geometry": {
                          "type": "Point",
                          "coordinates": options.center
                      }
                  }]
              }
          },
          "paint": {
            "circle-opacity": 0,
            "circle-stroke-width": 1,
            "circle-stroke-color": "#FFF",
            "circle-radius": radius
            // "circle-radius-transition": {
            //   "duration": 1000
            // }
          }
      });
    setInterval(() => {
        radius = {
            stops: [
              [0, 0],
              [20, maxRad]
            ],
            base: 2
        }
        if(i < cumPixels.length){
        if(maxRad < cumPixels[i]){
            // console.log(i, cumPixels[i], maxRad)
            maxRad += healthData[i].pixels / healthData[i].steps * 1000 || 1;
            map.setPaintProperty('points-30', 'circle-radius', radius);
        }
        else{
            let r = Math.round(Math.random()*255);
            let g = Math.round(Math.random()*255);
            let b = Math.round(Math.random()*255);
            let colorStr = 'rgba('+r+','+g+','+b+',0.3)';
            
            let dist = (cumDistance[i] - (cumDistance[i-30] || 0)).toFixed(2);
            if(dist > 1){
                let chart = document.createElement("li");
                chart.className = "index";
                chart.style.width = dist*2 +"px";
                chart.style.background = colorStr;
                let name = document.createElement("span");
                name.className = "info"
                name.innerHTML = healthData[i].date + ": " + dist + "km";
                chart.appendChild(name);
                
                document.querySelector('.chart').appendChild(chart);
            }
            map.addLayer({
                "id": "points"+ i,
                "type": "circle",
                "source": {
                    "type": "geojson",
                    "data": {
                        "type": "FeatureCollection",
                        "features": [{
                            "type": "Feature",
                            "geometry": {
                                "type": "Point",
                                "coordinates": options.center
                            }
                        }]
                    }
                },
                "paint": {

                  "circle-stroke-width": 1,
                  "circle-stroke-color": "#FFF",
                  "circle-color": colorStr,
                  "circle-radius": {
                        stops: [
                            [0, 0],
                            [20, cumPixels[i]]
                        ],
                        base: 2
                    }
                }
            }, "points"+(i-30).toString());
            console.log(i)
            i+=30;

        }
        
        }

        try {
            document.getElementById('distance').innerHTML = "Total Distance: " + cumDistance[i].toFixed(2) + "km" 
        } catch (error) {
            
        }
        

        
            
    }, 10);
});




