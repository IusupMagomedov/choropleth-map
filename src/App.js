import { useEffect, useRef, useState } from 'react';
import './App.css';
import * as d3 from "d3"
import * as topojson from "topojson-client"


function App() {
  
  const countyURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"
  const educationURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json"
  const svgRef = useRef(null)
  const [eduData, setEduData] = useState([])
  const [mapData, setMapData] = useState({})
  const w = 1000
  const h = 600


  useEffect(() => {
    // Fetching data
    d3.json(countyURL) //This function fetches data
      .then((data, error) => { // If there was an error let's log it
        if(error) {
          console.log("Error while fetching map data: ", error)
        } else { // Otherwise we save data to state
          //console.log("Just fetched map data: ", data)
          setMapData(topojson.feature(data, data.objects.counties).features)
          d3.json(educationURL) // After saving map data we can fetch eucation data
            .then((data, error) => {
              if(error) {// If there was an error let's log it
                console.log("Error while fetching education data: ", error)
              } else {// Otherwise we save data to the state
                // console.log("Just fetched education data: ", data)
                setEduData(data)
              }
            })
        }
      })
    return () => {}
  }, [])

  useEffect(() => {
    
    if(eduData.length) { //
      // console.log("US Education Data and passed to main useEffect method: ", eduData)
      // console.log("US County Data and passed to main useEffect method: ", mapData)

      //create min and max edu values for legend barchart
      const minEduValue = d3.min(eduData, d => d.bachelorsOrHigher)
      const maxEduValue = d3.max(eduData, d => d.bachelorsOrHigher)
      // console.log("Min educational data: ", minEduValue)      
      // console.log("Max educational data: ", maxEduValue)



      const svg = d3.select(svgRef.current) // Connecting an svg and assign width and height
        .attr('width', w)
        .attr('height', h)

      // only for bars 
      const zScale = d3.scaleSequential()
        .domain([minEduValue, maxEduValue])
        .interpolator(d3.interpolateYlGn);

      const getCounty = (mapElement, countyArray) => {
        const id = mapElement.id
        const county = countyArray.find(eduElement => eduElement.fips === id)
        // console.log("Entrance with a specific id: ", county)
        return county
      }

      svg.selectAll('path') // Create a map
        .data(mapData)
        .enter()
        .append('path')
        .attr('d', d3.geoPath())
        .attr('class', 'county')
        .attr("data-fips", mapDataElement => getCounty(mapDataElement, eduData).fips)
        .attr("data-education", mapDataElement => getCounty(mapDataElement, eduData).bachelorsOrHigher)
        .attr('fill', mapDataElement => zScale(getCounty(mapDataElement, eduData).bachelorsOrHigher))




      // const createSplicedArray = (arr1, arr2) => {
      //   const newArr = []
      //   for (let i = 0; i < arr1.length; i++) {
      //     newArr.push({
      //       "id": arr1[i].id,
      //       "geometry": arr1[i].geometry, 
      //       area_name: arr2[i].area_name,
      //       bachelorsOrHigher: arr2[i].bachelorsOrHigher,
      //       fips: arr2[i].fips,
      //       state: arr2[i].state
      //     })
      //   }
      //   return newArr
      // }
      // const splicedData = createSplicedArray(mapTopoData, eduData)
      // // console.log("Spliced data right after creation: ", splicedData)



      // svg.attr("width", w)
      //   .attr("height", h)
      //   .selectAll("path")
      //   .data(splicedData)
      //   .enter()
      //   .append("path")
      //   .attr("d", d => {
      //     //console.log("Coordinates in d: ", d.geometry.coordinates[0])

      //     const arrayOfcoordinates = d.geometry
      //       .coordinates[0]
      //       .map((coordinate, index) =>  `${index === 0 ? "M" : "L"}${coordinate[0]},${coordinate[1]}`)//
      //     console.log("Array of coordinates: ", arrayOfcoordinates)

      //     return arrayOfcoordinates.join("")
      //   })
      //   .attr("stroke", "black")
      //   .attr("fill", "green")
      //   .attr("data-fips", d =>d.fips)
      //   .attr("class", "county")
    }


    return () => {
      
    }
  }, [eduData, mapData])


  return (
    <div className="App">
      <h1 id="title">United States Educational Attainment</h1>
      <h4 id="description">Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)</h4>
      <svg ref={svgRef}>
      </svg>

    </div>
  );
}

export default App;
