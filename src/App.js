import { useEffect, useRef, useState } from 'react';
import './App.css';
import * as d3 from "d3"


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

      const svg = d3.select(svgRef.current)

      svg.attr("width", w)
        .attr("height", h)

      svg.append("rect")
        .attr("x", 10)
        .attr("y", 10)
        .attr("width", 100)
        .attr("height", 100)
        .attr("fill", "green")
    }


    return () => {
      
    }
  }, [eduData, mapData])


  return (
    <div className="App">
      <svg ref={svgRef}></svg>
    </div>
  );
}

export default App;
