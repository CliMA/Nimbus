import * as d3 from 'd3';
import React, { useRef, useEffect, useState } from 'react';
import Dropdown from './Dropdown';
//import legend from './ColorLegend';

function HorizontalSlice({
  current_time, altitude, contour_var, contour_var_opts,
  boxes_span, positivify, linearColorScale, dims }) {
  // --------------------------------------------------------
  // sets dimensions and displayed variable
  // --------------------------------------------------------
  const [displayedContour, setDisplayedContour] = useState(contour_var)

  const z_sample_rate = dims.z / boxes_span[displayedContour][0].length;

  // this variable corresponds to the dimensions of the 2D array for the contour
  const h_shape = {
    x: boxes_span[displayedContour][0][0].length,
    y: boxes_span[displayedContour][0][0][0].length
  };

  const pixelScale = window.innerHeight * 1/h_shape.x * .3;

  // console.log(h_shape);

  // --------------------------------------------------------
  // retrieves the arrays for the slices from the 3D data - 'full array' variables are
  // not currently used, but could be in order to change how colors are scaled
  // --------------------------------------------------------
  const slice_array      = boxes_span[displayedContour][current_time][altitude/z_sample_rate];
  const full_array       = boxes_span[displayedContour][0];
  const flat_slice_array = positivify([].concat.apply([], slice_array));
  // const flat_full_array  = positivify([].concat.apply([], ([].concat.apply([], full_array))));

  // saves real data range for color legend, but the contour functions need positive values,
  // so the slice array is made all positive
  const real_range       = d3.extent([].concat.apply([], ([].concat.apply([], full_array))))
  const value_range      = d3.extent(flat_slice_array);

  // creates contours using d3 - '10' refers to the number of contours
  const contours = d3.contours()
    .size([h_shape.x, h_shape.y])
    .thresholds(10)(flat_slice_array)

  // uses d3 scale to decide colors for each contour
  const contour_color = d3.scaleSequentialLog(value_range, linearColorScale)

  // d3 scales used to space out data points
  const cx = d3.scaleLinear([0,dims.x], [0, h_shape.x * pixelScale])
  const cy = d3.scaleLinear([0,dims.y], [h_shape.y * pixelScale, 0]);

  // --------------------------------------------------------
  // this function is not used for horizontal slicing, because the ratio of x to y
  // corresponds to the desired spacial aspect ratio - but in vertical slices it
  // is used to make a 76x65 array look like a 30x65 array

  // --------------------------------------------------------
  // const scaleContour = (contours, scale) => {
  //   return contours.map(({type, value, coordinates}) => (
  //     {type, value, coordinates: coordinates.map(rings => (
  //       rings.map(points => (
  //         points.map(([x, y]) => ([
  //           x*scale, y*scale
  //         ]))
  //       ))
  //     ))}
  //   ));
  // }

  // --------------------------------------------------------
  // this section actually draws the contours - they are drawn by directly accessing
  // the pixels on the screen using canvas rendering. They can also be drawn using svg element, as
  // is shown in the observable notebook - but canvas rendering is much faster, and should
  // be able to handle arrays that are larger than 65x65

  // --------------------------------------------------------
  const contourRef = useRef();
  const contourX_AxisRef = useRef();
  const contourY_AxisRef = useRef();

  useEffect(() => {

    //sets up canvas
    const canvasObj = contourRef.current;

    canvasObj.width = h_shape.x * pixelScale * 2;
    canvasObj.height = h_shape.y * pixelScale * 2;
    canvasObj.style.width = `${h_shape.x * pixelScale}px`;
    canvasObj.style.height = `${h_shape.y * pixelScale}px`;

    const context = canvasObj.getContext('2d');
    context.scale(2,2);

    const projection = d3.geoIdentity().scale(pixelScale);
    const path = d3.geoPath(projection).context(context);

    context.save();
    //clears canvas before rendering
    context.clearRect(0,0,canvasObj.width, canvasObj.height);

    //adds background color for high altitudes when the contours dont really exist
    context.fillStyle = "#023858";
    context.rect(0,0,canvasObj.width, canvasObj.height);
    context.fill();

    // draws each contour
    for (const contour of contours) {
       const threshold = contour.value;
       context.beginPath();
       context.fillStyle = contour_color(threshold);
       path(contour);
       context.fill();
       context.closePath();
    }

    context.restore();

    const xAxis = d3.axisBottom()
      .scale(cx)
      .ticks(4)

    const yAxis = d3.axisLeft()
      .scale(cy)
      .ticks(4)

    // creates svg element for x and y axes
    const svg_x = d3.select(contourX_AxisRef.current)
      .attr('width', pixelScale * h_shape.x + 10)
      .attr('height', 22)
      .attr("transform", `translate(10,-5)`);
      svg_x.selectAll("*").remove();

      svg_x.append("g")
        .attr("transform", `translate(-5,0)`)
        .call(xAxis);

    const svg_y = d3.select(contourY_AxisRef.current)
      .attr('width', 40)
      .attr('height', pixelScale * h_shape.y + 10)
      .attr("transform", `translate(0,-5)`);
      svg_y.selectAll("*").remove();

      svg_y.append("g")
        .attr("transform", `translate(35,5)`)
        .call(yAxis);
  });
  // --------------------------------------------------------
  // this section draws the color legend - the colors themselves are rendered
  // with canvas, while the numbers are an svg element. d3 is used to handle the
  // scaling for both
  // --------------------------------------------------------
  const colorLegendRef = useRef();
  const colorAxisRef = useRef();

  const color = d3.scaleSequential(real_range, linearColorScale);
  const ramp_color = color.interpolator();

  const n = h_shape.x * pixelScale;
  const x = Object.assign(color.interpolator(d3.interpolateRound(0,n)),
            {range() { return [0, n];}});

  useEffect(() => {
    const canvasObj = colorLegendRef.current;
    const context = canvasObj.getContext('2d');
    canvasObj.className = "color-legend";
    canvasObj.width = n;
    canvasObj.height = 10;
    context.strokeStyle = '#999999';
    context.save();

    for (let i = 0; i < n; ++i) {
      context.fillStyle = ramp_color(i / (n - 1));
      context.fillRect(i, 0, 1, canvasObj.height);
    }
    context.restore();

    const svg = d3.select(colorAxisRef.current)
      .attr('width', pixelScale * h_shape.x + 1)
      .attr('height', 22);
      svg.selectAll("*").remove();

      svg.append("g")
        .attr("transform", `translate(0,20)`)
        .call(d3.axisTop(x).ticks(5));

  });

   // --------------------------------------------------------
  // Handle dropdown change / contour variable selection
  // for each horizontal slice
  const onDropdownChange = item => {
    console.log(item)
    setDisplayedContour(item)
  }

  // --------------------------------------------------------
  // returns divs with the canvas and svg elements
  // --------------------------------------------------------
  return (
    <div className="horizontal-slice">
      <Dropdown
        default_var={ displayedContour }
        items={ contour_var_opts }
        onChange={ onDropdownChange }
      />
      <div className='horizontal-slice-contours'>
        <svg ref={ colorAxisRef } />
        <canvas ref={ colorLegendRef } />
        <div className="horizontal-contour">
          <svg ref={ contourY_AxisRef } />
          <canvas ref={ contourRef }></canvas>
        </div>
        <svg ref= { contourX_AxisRef } />
      </div>
    </div>
  );

}

export default HorizontalSlice;
