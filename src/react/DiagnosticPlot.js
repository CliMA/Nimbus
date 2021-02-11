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
        <div className='icon-download'>
          <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.2479 13.777H0.423681C0.189526 13.777 0 13.5875 0 13.3534C0 13.1192 0.189526 12.9297 0.423681 12.9297H11.2476C11.4817 12.9297 11.6713 13.1192 11.6713 13.3534C11.6713 13.5875 11.4817 13.777 11.2479 13.777Z" fill="#EDEDED"/>
            <path d="M5.83579 10.9038C5.60164 10.9038 5.41211 10.7143 5.41211 10.4802V0.423681C5.41211 0.189526 5.60164 0 5.83579 0C6.06994 0 6.25947 0.189526 6.25947 0.423681V10.4802C6.25947 10.714 6.06966 10.9038 5.83579 10.9038Z" fill="#EDEDED"/>
            <path d="M5.83554 11.118C5.73782 11.118 5.64009 11.0843 5.56043 11.0166L1.07648 7.18535C0.898536 7.03339 0.877352 6.76591 1.02931 6.58796C1.18155 6.41002 1.44904 6.38912 1.6267 6.54079L5.8138 10.1181L9.38825 6.56282C9.55377 6.39787 9.82238 6.39844 9.98733 6.56452C10.1523 6.73032 10.1517 6.99865 9.98564 7.1636L6.13438 10.9945C6.05219 11.0764 5.94401 11.118 5.83554 11.118Z" fill="#EDEDED"/>
          </svg>
        </div>
      </div>

      <div className="plot">
        <canvas ref={ canvasRef }></canvas>
        <svg ref={ svgref }></svg>
      </div>
    </div>
  );

}

export default DiagnosticPlot;
