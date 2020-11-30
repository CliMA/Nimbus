import * as d3 from 'd3';
import React, { useRef, useEffect } from 'react';

function DiagnosticYAxis({ slice_type, altitude }) {

  // dimensions
  const width = window.innerWidth - 50;

  const z_height = window.innerWidth * .1;

  // d3 scale
  const z_data_y = d3.scaleLinear()
    .domain([0,3000])
    .range([z_height, 0]);

  // draws axis and horizontal line based on altitude parameter
  const ref = useRef();

  useEffect(() => {

    // creates svg element
    const svg = d3.select(ref.current)
      .attr('width', width)
      .attr('height', z_height + 15);
    // removes old elements to prevent stacking
    svg.selectAll("*").remove();

    // adds axis
    svg.append("g")
      .attr("transform", `translate(40,10)`)
      .call(d3.axisLeft(z_data_y).ticks(z_height/50));

    // adds horizontal line
    if (slice_type === "HORIZONTAL") {
      svg.append("line")
        .attr("x1", 45)
        .attr("x2", width)
        .attr("transform", `translate(0,${z_data_y(altitude) + 10})`)
        .attr("stroke-width", 1.5)
        .attr("stroke", "#FFFFFF")
        .attr("opacity", .3);
    }

  });

  // returns div with svg element
  return (
    <div className="diagnostic-y-axis">
      <svg ref={ ref } />
    </div>
  );

}

export default DiagnosticYAxis;
