import React, { useState } from 'react';

export default function SiteSimulationsListItem({ selectSimulationDataset, simData, site_id }) {

  const [isChecked, setIsChecked] = useState(false)

  // --------------------------------------------------------
  function handleChecked(data) {
    setIsChecked(!isChecked);
    selectSimulationDataset(data)
  }

  // --------------------------------------------------------
  return (
    <li className='site-dataset-item'>
      <div className='dataset-item-container'>
        <div>
          <input 
            type="checkbox" 
            id={ `${site_id}-${simData.sim_id}` }
            name={ `${site_id}-${simData.sim_id}` } 
            value={ `${site_id}-${simData.sim_id}` } 
            checked={ isChecked } 
            onChange={ () => handleChecked({
              selection_id: `${site_id}-${simData.sim_id}`,
              site_id: site_id,
              sim_id: simData['sim_id']
            }) }
          />
          <label 
            className='simulation-id-label' 
            htmlFor={ `${site_id}-${simData.sim_id}` }
          >{ `sim_${ simData['sim_id'] }` }</label>
        </div>
        <div className='simulation-meta'>
          dimensions (X, Y, Z): <br />
            { simData.x_extent }km x { simData.y_extent }km x { simData.z_extent }km
            <br /><br />
          duration (h/m/s): <br />
           { simData['diagnostic_duration'] } (diagnostic) <br />{ simData['volumetric_duration'] } (volumetric)
           <br /><br />
          timesteps: <br />
          { simData['diagnostic_num_time_stamps'] } (diagnostic) <br /> { simData['volumetric_num_time_stamps'] } (volumetric)
        </div>
      </div>
    </li>
  );
}