import React, { useEffect, useState, useRef } from 'react';
import Dropdown from './Dropdown';

import land50 from '../assets/land-50m';
import geolocations from '../assets/geolocations';
import { active } from 'd3';
import { render } from 'react-dom';

const topojson = require('topojson');
const d3 = require('d3');

function WorldMap({ timeline_var, dbMetadataList , selectedDatasets }) {

  const simInfoVar = timeline_var;
  const projection = d3.geoNaturalEarth1();
  // const projection = d3.geoMercator();
  const all_points = Object.keys(geolocations).map(function(key){
    return geolocations[key];
  });

  let activeSites = dbMetadataList && dbMetadataList['sites'].map((site, idx) => {
    return parseInt(site.site_num);
  });
  let selectedSites = selectedDatasets.map((sim, idx) => {
    return parseInt(sim.site_id.slice(4,6));
  });
  let selectedSims = selectedDatasets.map((sim, idx) => {
    return sim.sim_id;
  });

  const timeline_data = dbMetadataList && selectedDatasets ? retrieve_timeline_data(dbMetadataList) : null;

  //geo_json objects
  const sphere = ({type: "Sphere"});
  const graticule = d3.geoGraticule10();
  const land = topojson.feature(land50, land50.objects.land);
  const all_locations = ({
    type: "FeatureCollection",
    features: [({
      type: "Feature",
      properties: ({}),
      geometry: ({
        type: "MultiPoint",
        coordinates: all_points
      })
    })]
  });

  const list_locations = ({
    type: "FeatureCollection",
    features: [({
      type: "Feature",
      properties: ({}),
      geometry: ({
        type: "MultiPoint",
        coordinates: activeSites ? activeSites.map(d => geolocations[d]) : []
      })
    })]
  });
  
  const selected_locations = ({
    type: "FeatureCollection",
    features: [({
      type: "Feature",
      properties: ({}),
      geometry: ({
        type: "MultiPoint",
        coordinates: selectedSites ? selectedSites.map(d=>geolocations[d]) : []
      })
    })]
  });

  function get_height() {
    const [[x0, y0], [x1, y1]] = d3.geoPath(projection.fitWidth(width, sphere)).bounds(sphere);
    const dy = Math.ceil(y1 - y0), l = Math.min(Math.ceil(x1 - x0), dy);
    projection.scale(projection.scale() * (l - 1) / l).precision(0.2);
    return dy;
  };

  function retrieve_timeline_data(db) {

    let displayed_site_num = selectedSites[0];
    let displayed_sim_id = selectedSims[0];

    if(displayed_site_num&&displayed_sim_id) {

      let data;
      let time;
      for (let i=0;i<db['sites'].length;i++) {
        let site = db['sites'][i];
        if (site['site_num'] == displayed_site_num.toString()) {
          for (let j=0;j<site['simulations'].length;j++) {
            let sim = site['simulations'][j];
            if (sim['sim_id'] == displayed_sim_id) {
              data = sim['timeline_data'][simInfoVar];
              time = sim['diagnostic_duration'];
            }
          }
        }
      }
      let filter_data = [];
      for (let i=0;i<data.length;i++) {
        filter_data.push(data[i][0]);
      }

      let ds = {
        data: filter_data,
        time: time
      }

      return ds;
    }
  }

  // function zoom(projection, {
  //   // Capture the projection’s original scale, before any zooming.
  //   scale = projection._scale === undefined
  //     ? (projection._scale = projection.scale()) 
  //     : projection._scale,
  //   scaleExtent = [0.8, 8]
  // } = {}) {
  //   let v0, q0, r0, a0, tl;
  
  //   const zoom = d3.zoom()
  //       .scaleExtent(scaleExtent.map(x => x * scale))
  //       .on("start", zoomstarted)
  //       .on("zoom", zoomed);
  
  //   function point(event, that) {
  //     const t = d3.pointers(event, that);
  
  //     if (t.length !== tl) {
  //       tl = t.length;
  //       if (tl > 1) a0 = Math.atan2(t[1][1] - t[0][1], t[1][0] - t[0][0]);
  //       zoomstarted.call(that, event);
  //     }
  
  //     return tl > 1
  //       ? [
  //           d3.mean(t, p => p[0]),
  //           d3.mean(t, p => p[1]),
  //           Math.atan2(t[1][1] - t[0][1], t[1][0] - t[0][0])
  //         ]
  //       : t[0];
  //   }
  
  //   function zoomstarted(event) {
  //     v0 = versor.cartesian(projection.invert(point(event, this)));
  //     q0 = versor((r0 = projection.rotate()));
  //   }
  
  //   function zoomed(event) {
  //     projection.scale(event.transform.k);
  //     const pt = point(event, this);
  //     const v1 = versor.cartesian(projection.rotate(r0).invert(pt));
  //     const delta = versor.delta(v0, v1);
  //     let q1 = versor.multiply(q0, delta);
  
  //     // For multitouch, compose with a rotation around the axis.
  //     if (pt[2]) {
  //       const d = (pt[2] - a0) / 2;
  //       const s = -Math.sin(d);
  //       const c = Math.sign(Math.cos(d));
  //       q1 = versor.multiply([Math.sqrt(1 - s * s), 0, 0, c * s], q1);
  //     }
  
  //     projection.rotate(versor.rotation(q1));
      
  //     // In vicinity of the antipode (unstable) of q0, restart.
  //     if (delta[0] < 0.7) zoomstarted.call(this, event);
  //   }
  
  //   return Object.assign(selection => selection
  //       .property("__zoom", d3.zoomIdentity.scale(projection.scale()))
  //       .call(zoom), {
  //     on(type, ...options) {
  //       return options.length
  //           ? (zoom.on(type, ...options), this)
  //           : zoom.on(type);
  //     }
  //   });
  // }

  const width = window.innerWidth * .65;
  const height = get_height();

  //canvas render for map

  const globeRef = useRef();

  useEffect(() => {
    const canvasObj = globeRef.current;
    canvasObj.width = width * 2;
    canvasObj.height = height * 2;
    canvasObj.style.width = `${width}px`;
    canvasObj.style.height = `${height}px`;

    const context = canvasObj.getContext('2d');
    context.scale(2,2);

    const path = d3.geoPath(projection, context);

    render();

    function render() {
      context.clearRect(0, 0, width, height);
      context.fillStyle = "#16171d";
      context.rect(0,0,width,height);
      context.fill();
      context.closePath();

      //sphere background
      context.beginPath();
      path(sphere);
      context.fillStyle = "#6f7490";
      context.fill();
      context.closePath();

      //lat/lon lines
      context.beginPath();
      path(graticule);
      context.strokeStyle = "rgba(255, 255, 255, 0.2)";
      context.lineWidth = .5;
      context.stroke();
      context.closePath();

      //land_forms
      context.beginPath();
      path(land);
      context.fillStyle = "#383a48";
      context.fill();
      context.closePath();

      //all_locations
      context.beginPath();
      path(all_locations);
      context.strokeStyle = "rgba(255, 255, 255, 0.2)";
      context.fillStyle = "rgba(255, 255, 255, 0.1)";
      context.lineWidth = 1;
      context.fill();
      context.stroke();
      context.closePath();

      //list_locations
      context.beginPath();
      path(list_locations);
      context.strokeStyle = "rgba(0, 0, 255, 0.4)";
      context.fillStyle = "rgba(0, 0, 255, 0.2)";
      context.lineWidth = 4;
      context.fill();
      context.stroke();
      context.closePath();

      //selected_locations
      context.beginPath();
      path(selected_locations);
      context.strokeStyle = "rgba(0, 0, 255, 0.4)";
      context.fillStyle = "rgba(0, 0, 255, 0.2)";
      context.lineWidth = 12;
      context.fill();
      context.stroke();
      context.closePath();
    }
  });

  // canvas render for info box

  const simInfoRef = useRef();
  const infoH = height/7 + 20;

  useEffect(() => {
    const canvasObj = simInfoRef.current;
    canvasObj.width = width * 2;
    canvasObj.height = infoH * 2;
    canvasObj.style.width = `${width}px`;
    canvasObj.style.height = `${infoH}px`;

    const context = canvasObj.getContext('2d');
    context.scale(2,2);

    render();

    function render() {

      context.clearRect(0, 0, width, infoH);
      // context.fillStyle = "rgba(200, 200, 200,.05)";
      // context.rect(0,0,width,infoH);
      context.fill();
      context.closePath();

      context.fillStyle = "rgba(200, 200, 200)";

      if (timeline_data) {

        //timestamps
        context.fillText("00:00:00", 5, infoH-5);
        context.fillText(timeline_data.time.slice(11,19),width-45,infoH-5);
        
        //title text
        context.font = '14px Rubik';
        context.fillText(
          "site" + 
          selectedSites[0] + 
          " / sim" + 
          selectedSims[0],
          5,18);
        context.textAlign = 'end';
        context.fillText(
          geolocations[selectedSites[0]][1] + 
          "°N , " + 
          geolocations[selectedSites[0]][0] + 
          "°E", 
          width, 18
        );

        //bar graph
        for (let i=0;i<timeline_data.data.length;i++) {
          let barW = width/timeline_data.data.length;
          let offset = barW*i;
          context.beginPath();
          context.fillStyle = "rgba(200, 200, 200)";
          context.rect(offset, infoH - 20, barW*.9, timeline_data.data[i]*-500);
          context.fill();
          context.closePath();
        }
      } else {
        //timestamps
        context.fillStyle = "rgba(200, 200, 200)";
        context.fillText("00:00:00",5, infoH-5);
        context.fillText("00:00:00",width-45,infoH-5);

        //placeholder bar graph (rectangle outline?)
        for (let i=0;i<181;i++) {
          let barW = width/181;
          let offset = barW*i;
          context.beginPath();
          context.fillStyle = "rgba(200, 200, 200)";
          context.rect(offset, infoH - 20, barW*.9, -10);
          context.fill();
          context.closePath();
        }
      }
    }
  });

  return (
    <div className="world-map">
      <div className='globe-projection'>
      <canvas ref={ globeRef }></canvas>
      </div>
      <div className='sim-info'>
      <canvas ref={ simInfoRef }></canvas>
      </div>
    </div>

  );
}

export default WorldMap;