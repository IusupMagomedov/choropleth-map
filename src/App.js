import { useEffect, useRef, useState } from 'react';
import './App.css';
import * as d3 from "d3"
import * as topojson from "topojson-client"


function App() {
  
  const svgRef = useRef(null)
  const [eduData, setEduData] = useState([])
  const [mapData, setMapData] = useState({})
  const w = 960
  const h = 600


  useEffect(() => {
    fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json")
      .then(response => response.json())
      .then(data => setEduData(data))
      .catch(error => console.log(error))

    fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json")
      .then(response => response.json())
      .then(data => setMapData(data))
      .catch(error => console.log(error))  
      


    return () => {}
  }, [])

  useEffect(() => {
    if(eduData.length > 0 && mapData.type) { //
      // console.log("Just fetched US Education Data: ", eduData)
      // console.log("Just fetched US County Data: ", mapData)  


      const mapTopoData = topojson.feature(mapData, mapData.objects.counties).features
      // console.log("Map data after topojson: ", mapTopoData)

      const createSplicedArray = (arr1, arr2) => {
        const newArr = []
        for (let i = 0; i < arr1.length; i++) {
          newArr.push({
            "id": arr1[i].id,
            "geometry": arr1[i].geometry, 
            area_name: arr2[i].area_name,
            bachelorsOrHigher: arr2[i].bachelorsOrHigher,
            fips: arr2[i].fips,
            state: arr2[i].state
          })
        }
        return newArr
      }
      const splicedData = createSplicedArray(mapTopoData, eduData)
      // console.log("Spliced data right after creation: ", splicedData)


      const svg = d3.select(svgRef.current)

      svg.attr("width", w)
        .attr("height", h)
        .selectAll("path")
        .data(splicedData)
        .enter()
        .append("path")
        .attr("p", d => {
          console.log("Coordinates in d: ", d.geometry.coordinates)

          const arrayOfcoordinates = d.geometry
            .coordinates
            .map((coordinate, index) =>  coordinate[0])//(index === 0 ? "M" : "L") +
            console.log("Array of coordinates: ", arrayOfcoordinates)

          // return arrayOfcoordinates.join("")
        })
        .attr("stroke", "black")
        .attr("fill", "green")
    }


    return () => {
      
    }
  }, [eduData, mapData])


  return (
    <div className="App">
      <svg ref={svgRef}>
      </svg>

    </div>
  );
}

export default App;
