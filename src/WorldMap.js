import React, { useState } from 'react';
import ReactGlobe from 'react-globe';

function WorldMap({ geocoords }) {

  return (
    <ReactGlobe 
      globeTexture="https://raw.githubusercontent.com/MattLoftus/threejs-space-simulations/master/images/earth_texture_2.jpg"
    />
  );
}

export default WorldMap;