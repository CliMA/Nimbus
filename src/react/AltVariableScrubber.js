import * as d3 from 'd3';
import React, { useRef, useEffect } from 'react';

function AltVariableScrubber({
  currentAltVar, handleUpdateInterval, customRange, data }) {

  // --------------------------------------------------------
  // function to scale array so that multiple bars show up for each data point (graphical)
  // --------------------------------------------------------
  const scaleArray = (base_array, scale) => {

    var new_array = [];
    for(let i = 0; i < base_array.length; i++) {
      for(let j = 0; j < scale; j++) {
        new_array.push(base_array[i]);
      }
    }
    return new_array;
  }
  // -------------------------------------------------------
  // get averages at each time stamp for the chosen variable, and scale the array so that the
  // bars look good. Set width to window width, and initialize the labels
  // --------------------------------------------------------
  // const alt_var_array = d3.zip(...data[currentAltVar]).map(d => d3.mean(d));
  const alt_var_array = data[currentAltVar].map(d => d3.mean(d));

  const scaleAmt = 2;
  const scaled_array = scaleArray(alt_var_array, scaleAmt); //2 means there are twice as many bars that are half as wide
  const time_size = ({ w: window.innerWidth, h: 35 });
  var leftTimeStamp =  "00:00:00";
  var rightTimeStamp = "00:00:00";

  const margin = {
    right: 20,
    left: 10,
    top: 8
  }

  // --------------------------------------------------------
  // D3 scales to fit data into desired window size
  // --------------------------------------------------------
  const time_x = d3.scaleLinear()
    .domain([0, scaled_array.length])
    .range([margin.left, time_size.w - margin.right]);

  const time_y = d3.scaleLinear()
    .domain(d3.extent(scaled_array))
    .range([0, time_size.h - margin.top]);

  const step_size = (time_size.w / scaled_array.length) * 0.8;

  // --------------------------------------------------------
  // converts indexes to time stamps to hrs and minutes. this function would need to
  // change for other simulations. THIS NEEDS TO CHANGE
  // --------------------------------------------------------
  const convertToTimestamp = ( start_index, num ) => {
    var hrs = ('0' + Math.floor((start_index + num) * 2 / 60)).slice(-2);
    var mins = ('0' + (start_index + num) * 2 % 60).slice(-2);
    var string = `${hrs}:${mins}:00`

    return string;
  }

  // --------------------------------------------------------
  // draws the handles for the time range
  // --------------------------------------------------------
  const handlePath = (d) => {
    var e = +(d.type === "e"),
        x = e ? 1 : -1,
        y = time_size.h + margin.top;
    return "M" + (.5 * x) + "," + y + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6) + "V" + (2 * y - 6) +
      "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y) + "ZM" + (2.5 * x) + "," + (y + 8) + "V" + (2 * y - 8) +
      "M" + (4.5 * x) + "," + (y + 8) + "V" + (2 * y - 8);
    }

  // --------------------------------------------------------
  // brushing function that gets called whenever scrubber range changes
  // --------------------------------------------------------
  const brushing = () => {

    if (!d3.event.selection && !d3.event.sourceEvent) return;

    // fills area
    const selection = d3.event.selection ? d3.event.selection : [1, 2].fill(d3.event.sourceEvent.offsetX);

    if (selection != null) {
      const [x1, x2] = [selection[0],selection[1]];
      const range = [ Math.round(time_x.invert(x1 / scaleAmt)), Math.round(time_x.invert(x2 / scaleAmt))];
      // changes time labels
      leftTimeStamp = convertToTimestamp(0,range[0]);
      rightTimeStamp = convertToTimestamp(0,range[1]);
      // updates diagnostic plots
      handleUpdateInterval(range[0], range[1]);
    }
  }

  // --------------------------------------------------------
  // creates d3 brush object
  // --------------------------------------------------------
  const brush = d3.brushX()
    .handleSize(10)
    .extent([[margin.left + 10, 0], [time_size.w - margin.right, time_size.h + margin.top]])
    .on('start brush end', brushing)

  // --------------------------------------------------------
  // handles the actual drawing of the chart and brush
  // --------------------------------------------------------
  const altVarRef = useRef();

  useEffect(() => {

    // creates svg element
    const svg = d3.select(altVarRef.current)
      .attr('width', time_size.w + margin.left + margin.right)
      .attr('height', time_size.h + margin.top)
      .attr('class', 'alt-var-scrubber-svg')

    // removes old elements to avoid stacking
    svg.selectAll("*").remove();

    // adds the bar chart
    svg.append('g')
      .selectAll('rect')
      .data(scaled_array)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr("x", (d,i) => time_x(i) + 2*step_size)
      .attr("y", d => time_size.h + margin.top - time_y(d))
      .attr("height", d => time_y(d))
      .attr("width", step_size)
      .attr("fill", '#cacbe7')
      .attr('opacity', 0.8);

    // adds the brush
    const gBrush = svg.append('g')
      .call(brush)
      .call(brush.move, [ time_x(customRange.left) * scaleAmt , time_x(customRange.right ) * scaleAmt]);

    // adds custom brush handles
    gBrush.selectAll(".handle--custom")
      .data([{ type: "w" }, { type: "e" }])
      .attr('class', d => `handles ${d}`)
      .join(enter => enter
        .append("path")
        .attr("class", "handle--custom")
        .attr("stroke-width", 1)
        .attr("stroke", "#1f1e25")
        .attr("fill", "#cacce7")
        .attr("fill-opacity", 1)
        .attr("cursor", "ew-resize")
        .attr("d", handlePath))
      .attr('transform', (d,i) => {
        const x = i === 0 ? time_x(customRange.left ) * scaleAmt  : time_x(customRange.right) * scaleAmt;
        return `translate(${x}, ${-time_size.h-margin.top})`;
      });

    // adds labels
    const left_label = svg.append("g")
      .attr('transform', `translate(${margin.left + 18},12)`)
    left_label.append("text")
      .attr("fill", "#fff")
      .attr("font-size", "12px")
      .text(leftTimeStamp)

    const right_label = svg.append("g")
      .attr('transform', `translate(${time_size.w - margin.right - 8},12)`)
    right_label.append("text")
      .attr("text-anchor", "end")
      .attr("fill", "#fff")
      .attr("font-size", "12px")
      .text(rightTimeStamp)

  });

  // --------------------------------------------------------
  // returns div with svg element in it
  // --------------------------------------------------------
  return(
    <div className="alt-variable-scrubber">

      <svg ref={ altVarRef }></svg>

    </div>
  )
}

export default AltVariableScrubber;
