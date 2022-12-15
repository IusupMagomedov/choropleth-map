import { useEffect, useRef, useState } from 'react';
import './App.css';
import * as d3 from "d3"
import * as topojson from "topojson-client"


function App() {
  
  const countyURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"
  const educationURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json"
  const svgRef = useRef(null)
  const toolTipRef = useRef(null)
  const [eduData, setEduData] = useState([])
  const [mapData, setMapData] = useState({})
  const w = 1000
  const h = 700
  const padding = 60
  const legendGradeCount = 15
  const legendRectEdge = 25


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

      const tooltip = d3.select(toolTipRef.current) // Connecting an toolTip

      // Scale for colors
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
        .attr('stroke-width', '1px')
        .attr('stroke', 'green')
        .on('mouseover', (event, mapDataElement) => {
          // console.log("Map element in mouse over call back function: ", mapDataElement)
          // console.log("Edu data in mouse over call back function: ", eduData)
          // console.log("Mouse event in mouse over call back function: ", event)
          const county = getCounty(mapDataElement, eduData)
          // console.log("Entrance with a specific id: ", county)
          const target = d3.select(event.target)
          target.transition()
            .attr('stroke-width', '2px')
            .attr('stroke', 'black')
          tooltip.transition()
            .style('visibility', 'visible')
            .style('position',"absolute")
            .style('top', `${event.y + 5}px`)
            .style('left', `${event.x + 20}px`)
            .attr('data-education', county.bachelorsOrHigher)
            .text(`${county.area_name}, ${county.state}, ${county.bachelorsOrHigher}%`)           
        })
        .on('mouseout', event => {
          tooltip.transition().style('visibility', 'hidden')
          const target = d3.select(event.target)
          target.transition()
            .attr('stroke-width', '1px')
            .attr('stroke', 'green')
        })


      // ------------- make a legend ---------------------------------------------------

      const legend = svg.append('g')
        .attr("id", "legend")
        .attr("transform", `translate(${padding + 50}, ${h - padding})`)
        
      const legendArrayGeneration = (min, max, count) => {
          const array = []
          for (let i = min; i <= max; i = (i + (max - min) / count)) {
            array.push(i)
          }
          return(array)
        }
        // making an array from min to max with conut items
        const legendArray = legendArrayGeneration(minEduValue, maxEduValue, legendGradeCount)
  
        //console.log("Initial legendArray looks like: ", legendArray)
  
  
        
        // drawing legend rects
        legend.selectAll("rect")
          .data(legendArray)
          .enter()
          .append("rect")
          .attr("x", (d, i) => i * legendRectEdge)
          .attr("y", 0)
          .attr("width", legendRectEdge)
          .attr("height", legendRectEdge)
          .attr("fill", d => zScale(d))
          .attr("stroke", "black")
          .attr("stroke-width", 1)
        
        // only for legend
        const zScaleLegend = d3.scaleBand()
          .domain(legendArray)
          .range([0, (legendGradeCount + 1) * legendRectEdge])
  
        
        const zAxis = d3.axisBottom(zScaleLegend)
          .tickFormat(x => `${x.toFixed(0)}%`)
  
        legend.append("g")
          .call(zAxis)
          .attr("transform", `translate(0, ${legendRectEdge})`)

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
      <div id="tooltip" ref={toolTipRef}>
      </div>

    </div>
  );
}

export default App;
