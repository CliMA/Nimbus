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
          >{ simData['sim_id'] }</label>
        </div>
        <div className='simulation-meta'>
          domain dimensions: 
            { simData['domain_dims']['width'] }{ simData['domain_dims']['units'] } x
            { simData['domain_dims']['depth'] }{ simData['domain_dims']['units'] } x
            { simData['domain_dims']['height'] }{ simData['domain_dims']['units'] } 
            <br/>
          duration (h/m/s): 
          { simData['duration']['hrs'] }:{ simData['duration']['min'] }:{ simData['duration']['sec'] }
          <br/>
          time steps: { simData['time_steps'] }
        </div>
      </div>
    </li>
  );
}