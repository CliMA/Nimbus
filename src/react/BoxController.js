import React, { useRef, useEffect } from 'react';
import Vertex from './Vertex.js';

function BoxController({slice_axis, altitude, current_vertical_axis, x_slice_value, y_slice_value, dims}) {

  // --------------------------------------------------------
  // many of the values in this function are specific to this simulation,
  // and would need to be updated for simulations with different dimensions
  // --------------------------------------------------------
  // --------------------------------------------------------
  // skeleton
  // --------------------------------------------------------
  const bounds = {
    "x": dims.x/2000,
    "nx" : dims.x/-2000,
    "y": dims.y/2000,
    "ny": dims.y/-2000,
    "z": dims.z/2000,
    "nz": dims.z/-2000
  };

  const vertices = [
    new Vertex(bounds.nx, bounds.nz, bounds.ny), // Front-Bottom-Left
    new Vertex( bounds.x, bounds.nz, bounds.ny), // Front-Bottom-Right
    new Vertex(bounds.nx, bounds.nz,  bounds.y), // Rear-Bottom-Left
    new Vertex( bounds.x, bounds.nz,  bounds.y), // Rear-Bottom-Right
    new Vertex(bounds.nx,  bounds.z, bounds.ny), // Front-Top-Left
    new Vertex( bounds.x,  bounds.z, bounds.ny), // Front-Top-Right
    new Vertex(bounds.nx,  bounds.z,  bounds.y), // Rear-Top-Left
    new Vertex( bounds.x,  bounds.z,  bounds.y)  // Rear-Top-Right
  ];
  const faces = [
    new Polygon([vertices[0], vertices[1], vertices[5], vertices[4]]), // Front
    new Polygon([vertices[2], vertices[3], vertices[7], vertices[6]]), // Rear
    new Polygon([vertices[0], vertices[1], vertices[3], vertices[2]]), // Bottom
    new Polygon([vertices[4], vertices[5], vertices[7], vertices[6]]), // Top
    new Polygon([vertices[0], vertices[2], vertices[6], vertices[4]]), // Left
    new Polygon([vertices[1], vertices[3], vertices[7], vertices[5]]), // Right
  ];
  // --------------------------------------------------------
  // projection
  // --------------------------------------------------------
  const oblique = ({
    gx: (scale, zc) => (vertex) => (vertex.x + vertex.z * zc) * scale,
    gy: (scale, zc) => (vertex) => (vertex.y + vertex.z * zc) * scale,
  });

  // --------------------------------------------------------
  // decide which slice to draw and where based on state variables passed in,
  // and create a polygon to be drawn
  // --------------------------------------------------------
  const get_current_slice = (axis, alt, vert_axis, x_val, y_val) => {
    var scaled_val;
    var slice_vertices;
    if (axis === "HORIZONTAL") {
      scaled_val = scale_slice_value("z",alt);
      slice_vertices = [
        new Vertex(bounds.nx, scaled_val, bounds.ny), // Front-Left
        new Vertex( bounds.x, scaled_val, bounds.ny), // Front-Right
        new Vertex(bounds.nx, scaled_val,  bounds.y), // Rear-Left
        new Vertex( bounds.x, scaled_val,  bounds.y) // Rear-Right
      ];
    } else {
      if (vert_axis === "X") {
        scaled_val = scale_slice_value("x",x_val);
        slice_vertices = [
          new Vertex(scaled_val, bounds.nz, bounds.ny), // Front-Bottom
          new Vertex(scaled_val, bounds.nz,  bounds.y), // Rear-Bottom
          new Vertex(scaled_val,  bounds.z, bounds.ny), // Front-Top
          new Vertex(scaled_val,  bounds.z,  bounds.y)  // Rear-Top
        ];
      } else {
        scaled_val = scale_slice_value("y",y_val);
        slice_vertices = [
          new Vertex(bounds.nx, bounds.nz, scaled_val), // Front-Bottom-Left
          new Vertex( bounds.x, bounds.nz, scaled_val), // Front-Bottom-Right
          new Vertex(bounds.nx,  bounds.z, scaled_val), // Front-Top-Left
          new Vertex( bounds.x,  bounds.z, scaled_val)  // Front-Top-Right
        ]
      }
    }
    return new Polygon([slice_vertices[0],slice_vertices[1],slice_vertices[3],slice_vertices[2]]);
  }

  // scales spacial value to correct size for this model
  const scale_slice_value = (axis, value) => {
    if (axis === "z") {
      return (value/1000) - bounds.z;
    } else {
      return (value/1000) - bounds.x;
    }
  }

  // --------------------------------------------------------
  // draws a given polygon onto the canvas
  // --------------------------------------------------------
  const drawPolygon = (context, polygon, fx, fy, fill) => {
    context.beginPath();
    // The -1 * is used to flip the y coordinate as y value increases
    // as you move down the canvas.
    context.moveTo(fx(polygon.vertex(0)), -1 * fy(polygon.vertex(0)));
    for (var i = 1; i < polygon.count(); ++i) {
      context.lineTo(fx(polygon.vertex(i)), -1 * fy(polygon.vertex(i)));
    }
    context.closePath();
    context.stroke();
    if(fill === 1) {
      context.fill();
    }

  }
  // --------------------------------------------------------

  // utility polygon function
  function Polygon(vertices) {
    this.count = function() {
      return vertices.length;
    };
    this.vertex = function(i) {
      if (i < 0) {
        throw new Error('Vertex index must be a positive integer')
      }
      if (i >= vertices.length) {
        throw new Error('Vertex index out of bounds');
      }
      return vertices[i];
    };
  }

  // --------------------------------------------------------
  // handles the actual drawing
  // --------------------------------------------------------
  const canvasRef = useRef();

  useEffect(() => {

    // sets up canvas
    const canvasObj = canvasRef.current;
    canvasObj.width = 500;
    canvasObj.height = 300;
    canvasObj.style.width = "250px";
    canvasObj.style.height = "150px";
    const context = canvasObj.getContext('2d');
    context.scale(2,2);

    context.save()

    // --------------------------------------------------------
    // draw box
    // --------------------------------------------------------
    context.clearRect(0,0,canvasObj.width, canvasObj.height);
  	context.translate(canvasObj.width / 4, canvasObj.height / 4); // 0 should be in the centre
  	context.strokeStyle = '#666666';
    context.fillStyle = '#666666';

  	const modelSize = canvasObj.width / 8;
  	const scale = modelSize / 2;
  	const c = 0.2;
  	const fx = oblique.gx(scale, c);
  	const fy = oblique.gy(scale, c);

  	for (var i = 0; i < faces.length; ++i) {
  		drawPolygon(context, faces[i], fx, fy, 0);
  	}

    // draws slice
    context.strokeStyle = 'rgba(255,255,255,1)';
    context.fillStyle = 'rgba(255,255,255,.3)';

    const current_slice = get_current_slice(slice_axis, altitude, current_vertical_axis, x_slice_value, y_slice_value);

    drawPolygon(context, current_slice, fx, fy, 1);

    context.restore()
  });

  // returns div with canvas element
  return (
    <div className="box-canvas" >
      <canvas ref={ canvasRef } />
    </div>
  );
}

export default BoxController;
