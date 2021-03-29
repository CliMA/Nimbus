import * as d3 from 'd3';
import React, { useRef, useEffect, useState } from 'react';
import Dropdown from './Dropdown';

function VerticalSlice({
  currentVerticalAxis, currentVerticalX, currentVerticalY,
	current_time, contour_var, contour_var_opts,
	boxes_span, positivify, linearColorScale, dims }) {

  // --------------------------------------------------------
  // sets dimensions and displayed variable
  // --------------------------------------------------------
  const [displayedContour, setDisplayedContour] = useState(contour_var);

  const pixelScale = window.innerHeight * 0.008;

  // this variable corresponds to the dimensions of the 2D array for the contour
  // ry corresponds to the desired spatial dimensions
  const v_shape = {
    x: dims.x / 100,
    y: boxes_span[displayedContour].length,
    ry: dims.z / 100
  };

  // --------------------------------------------------------
  // array to be displayed
  // --------------------------------------------------------
  const display_array = () => {
    if (currentVerticalAxis === 'Y') {
      return d3.zip(...boxes_span[displayedContour][current_time].map(d => d3.zip(...d)))[currentVerticalY/100].reverse();
    } else {
      return d3.zip(...boxes_span[displayedContour][current_time])[currentVerticalX/100].reverse();
    }
  }

  const v_full_flat_array = positivify([].concat.apply([], ([].concat.apply([], boxes_span[displayedContour][0]))));
  const v_test_array_flat = positivify([].concat.apply([], display_array()));

  // saves real data range for color legend, but the contour functions need positive values,
  // so the slice array is made all positive
  const v_real_range = d3.extent([].concat.apply([], ([].concat.apply([],boxes_span[displayedContour][0]))));
  const v_value_range = d3.extent(v_full_flat_array);

  // creates contours using d3 - '15' refers to the number of contours
  const v_contours = d3.contours()
    .size([v_shape.x, v_shape.y])
    .thresholds(15)(v_test_array_flat)

  // uses d3 scale to decide colors for each contour and set spatial scales
  const v_contour_color = d3.scaleSequentialLog(v_value_range, linearColorScale);
  const v_cx = d3.scaleLinear(d3.extent(dims.y), [0, v_shape.x * pixelScale]);
  const v_cy = d3.scaleLinear(d3.extent(dims.z).reverse(), [0, v_shape.ry * pixelScale]);

  // --------------------------------------------------------
  // Scale function for cooridinates in contour
  // (Without scaling, coordinates corresponds to index)
  const v_scaleContour = (contours, scale) => {
    return contours.map(({type, value, coordinates}) => (
      {type, value, coordinates: coordinates.map(rings => (
        rings.map(points => (
          points.map(([x, y]) => ([
            x*scale, y*scale*this.v_shape.ry/this.v_shape.y
          ]))
        ))
      ))}
    ));
  }

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

    canvasObj.width = v_shape.x * pixelScale * 2;
    canvasObj.height = v_shape.ry * pixelScale * 2;
    canvasObj.style.width = `${v_shape.x * pixelScale}px`;
    canvasObj.style.height = `${v_shape.ry * pixelScale}px`;

    const context = canvasObj.getContext('2d');
    context.scale(2,2);

    const projection = d3.geoIdentity().scale(pixelScale);
    const path = d3.geoPath(projection).context(context);

    context.save();
    //clears canvas before rendering
    context.clearRect(0,0,canvasObj.width, canvasObj.height);

    context.fillStyle = "#023858";
    context.rect(0,0,canvasObj.width, canvasObj.height);
    context.fill();

    // draws each contour
    for (const contour of v_scaleContour(v_contours, 1)) {
       const threshold = contour.value;
       context.beginPath();
       context.fillStyle = v_contour_color(threshold);
       path(contour);
       context.fill();
       context.closePath();
    }

    context.restore();

    // creates svg element for x and y axes
    const svg_x = d3.select(contourX_AxisRef.current)
      .attr('width', pixelScale * v_shape.x)
      .attr('height', 22);
      svg_x.selectAll("*").remove();

      svg_x.append("g")
        .attr("transform", `translate(-5,5)`)
        .call(d3.axisBottom(v_cx).ticks(v_shape.x/(pixelScale * 2)));

    const svg_y = d3.select(contourY_AxisRef.current)
      .attr('width', 40)
      .attr('height', pixelScale * v_shape.ry);
      svg_y.selectAll("*").remove();

      svg_y.append("g")
        .attr("transform", `translate(35,5)`)
        .call(d3.axisLeft(v_cy).ticks(v_shape.y/(pixelScale * 4)));

  });

  // --------------------------------------------------------
  // this section draws the color legend - the colors themselves are rendered
  // with canvas, while the numbers are an svg element. d3 is used to handle the
  // scaling for both
  // --------------------------------------------------------
  const colorLegendRef = useRef();
  const colorAxisRef = useRef();

  const color = d3.scaleSequential(v_real_range, linearColorScale);
  const ramp_color = color.interpolator();

  const n = v_shape.x * pixelScale;
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
      .attr('width', pixelScale * v_shape.x + 1)
      .attr('height', 22);
      svg.selectAll("*").remove();

      svg.append("g")
        .attr("transform", `translate(0,20)`)
        .call(d3.axisTop(x).ticks(v_shape.x/(pixelScale*4)));

  });

  // --------------------------------------------------------
  // Handle dropdown change / contour variable selection
  // for each vertical slice
  const onDropdownChange = item => {
    console.log(item);
    setDisplayedContour(item);
  }

  // --------------------------------------------------------
  // returns divs with the canvas and svg elements
  // --------------------------------------------------------
  return (
    <div className="vertical-slice">
      <Dropdown
        default_var={ displayedContour }
        items={ contour_var_opts }
        onChange={ onDropdownChange }
      />
      <div className='vertical-slice-contours'>
        <svg ref={ colorAxisRef } />
        <canvas ref={ colorLegendRef } />
        <div className="vertical-contour">
          <svg ref= { contourY_AxisRef } />
          <canvas ref={ contourRef }></canvas>
        </div>
        <svg ref={ contourX_AxisRef } />
      </div>
    </div>
  );
}

export default VerticalSlice;
