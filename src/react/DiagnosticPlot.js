import * as d3 from 'd3';
import React, { useRef, useEffect, useState } from 'react';
import Dropdown from './Dropdown';

function DiagnosticPlot({
  compareOn, extentsOn, customRange, defaultVars, defaultVar, data, metaData
}) {

  const [displayedVar, setDisplayedVar] = useState(defaultVar);

  // --------------------------------------------------------
  // EXTENTS - the two sets of extents are currently hardcoded, but this function
  // could be used to replace the two lines below

  const extents = (dataset) => {
    return d3.zip(...dataset[displayedVar]).map(d => d3.extent(d.slice(customRange.left,customRange.right)));
  }

  const extents1 = d3.zip(...data[displayedVar]).map(d => d3.extent(d.slice(customRange.left,customRange.right)));
  //const extents2 = d3.zip(...data[1][displayedVar]).map(d => d3.extent(d.slice(customRange.left,customRange.right)));

  // --------------------------------------------------------
  // MEANS - the two sets of means are currently hardcoded, but this function
  // could be used to replace the two lines below

  // const means = (dataset) => {
  //   return dataset[displayedVar].map(d => d3.mean(d.slice(customRange.left,customRange.right)));
  // }

  const means1 = d3.zip(...data[displayedVar]).map(d => d3.mean(d.slice(customRange.left,customRange.right)));
  //const means2 = d3.zip(...data[1][displayedVar]).map(d => d3.mean(d.slice(customRange.left,customRange.right)));
  // --------------------------------------------------------
  // UTILS

  const z_mod = metaData["diagnostic_altitude_extent"]/metaData["diagnostic_altitudes"].length

  const axis_height = 20;

  const width = window.innerWidth * .2;

  const z_height = width * .5;

  // d3 scales to draw lines and axes
  const z_data_y = d3.scaleLinear()
    .domain([0, metaData["diagnostic_altitude_extent"]])
    .range([z_height, 0]);


  const default_x = d3.scaleLinear()
    .domain(d3.extent(d3.merge(extents(data))))
    .range([0, width]);


  // creates area element for extent from given data
  const default_extent_shadow = d3.area()
    .x0(d => default_x(d[0]))
    .x1(d => default_x(d[1]))
    .y((d, i) => z_data_y(i*z_mod));


  // creates line for mean from given data
  const default_line = d3.line()
    .x(d => default_x(d))
    .y((d,i) => z_data_y(i*z_mod));

  // creates x axis
  const default_xAxis = (g) => {
      g.call(d3.axisBottom(default_x).ticks(width / 80).tickSizeOuter(0));
  }
  // --------------------------------------------------------
  // canvas implementation
  // --------------------------------------------------------
  const canvasRef = useRef();
  const svgref = useRef();

  useEffect(() => {

    // sets up canvas
    const canvasObj = canvasRef.current;
    canvasObj.width = width*2;
    canvasObj.height = z_height*2;
    canvasObj.style.width = `${width}px`;
    canvasObj.style.height = `${z_height}px`;
    const context = canvasObj.getContext('2d');
    context.scale(2,2);

    // declares functions
    default_extent_shadow.context(context);
    default_line.context(context);

    context.save();
    // clears canvas to redraw
    context.clearRect(0,0,canvasObj.width, canvasObj.height);

    // extents
    if (extentsOn) {
      context.beginPath();
      default_extent_shadow(extents1);
      context.fillStyle = 'rgba(154,219,255,.4)';
      context.fill();
      context.closePath();

      // if (compareOn) {
      //   context.beginPath();
      //   default_extent_shadow(extents2);
      //   context.fillStyle = 'rgba(197,161,215,.4)';
      //   context.fill();
      //   context.closePath();
      // }
    }

    // mean lines
    context.beginPath();
    default_line(means1);
    context.strokeStyle = 'rgb(154,219,255)';
    context.lineWidth = 1.5;
    context.stroke();
    context.closePath();

    // if (compareOn) {
    //   context.beginPath();
    //   default_line(means2);
    //   context.strokeStyle = 'rgb(197,161,215)';
    //   context.lineWidth = 1.5;
    //   context.stroke();
    //   context.closePath();
    // }

    context.restore();

    // creates svg element for x axis
    const svg = d3.select(svgref.current)
      .attr('width', width + 5)
      .attr('height', axis_height)
      .attr("transform", `translate(0,0)`);

      svg.selectAll("*").remove();

      svg.append("g").call(default_xAxis);
  });

  // --------------------------------------------------------
  // Handle dropdown change / variable selection
  // for diagnostic plots
  const onDropdownChange = item => {
    setDisplayedVar(item);
  }


  // --------------------------------------------------------
  // returns divs with the dropdown menu, the plot in a canvas element,
  // and the axis in a svg element
  // --------------------------------------------------------
  return (
    <div className="diagnostic-plot">
      <div className='diagnostic-plot-header'>
        <Dropdown
          default_var={ displayedVar }
          items={ defaultVars }
          onChange={ onDropdownChange }
        />
      </div>

      <div className="plot">
        <canvas ref={ canvasRef }></canvas>
        <svg ref={ svgref }></svg>
      </div>
    </div>
  );

}

export default DiagnosticPlot;
