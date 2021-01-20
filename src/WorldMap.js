import React, { useState } from 'react';
import ReactGlobe from 'react-globe';

function WorldMap({ dbMetadataList }) {

  console.log('[ WorldMap ] dbMetadataList', dbMetadataList);
  const options = {};

  let geoMarkers = dbMetadataList && dbMetadataList['sites'].map((site, idx) => {

    // The default marker renderer expects these properties
    // We can make a custom one later
    return {
      id: parseInt(site.site_num),
      value: parseInt(site.site_num),
      color: 'white',
      coordinates: [site.geocoordinates.lat, site.geocoordinates.lon]
    }
  });

  console.log(geoMarkers);

  return (
    <ReactGlobe
      markers={ geoMarkers }
      options={ options }
      globeBackgroundTexture={ null }
      globeTexture="https://raw.githubusercontent.com/MattLoftus/threejs-space-simulations/master/images/earth_texture_2.jpg"
    />
  );
}

export default WorldMap;