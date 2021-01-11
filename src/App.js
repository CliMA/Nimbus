import React, { Component } from 'react';
import './App.css';
import Viewer from './Viewer';
import SiteSimulationsList from './SiteSimulationsList';

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedDatasets: [],
      hasLaunched: false
    }
  }

  // SAMPLE DATA
  site_01_data = {
    site_id: 'site_01',
    geocoordinates: [],
    simulations: [
      {
        sim_id: 'simulation_01',
        domain_dims: {
          units: 'km',
          width: 6.4,
          depth: 6.4,
          height: 3.0
        },
        duration: {
          hrs: 6,
          min: 0,
          sec: 0
        },
        time_steps: 180
      },
      {
        sim_id: 'simulation_02',
        domain_dims: {
          units: 'km',
          width: 6.4,
          depth: 6.4,
          height: 3.0
        },
        duration: {
          hrs: 4,
          min: 30,
          sec: 30
        },
        time_steps: 40
      },
      {
        sim_id: 'simulation_03',
        domain_dims: {
          units: 'km',
          width: 6.4,
          depth: 6.4,
          height: 3.0
        },
        duration: {
          hrs: 5,
          min: 45,
          sec: 0
        },
        time_steps: 60
      }
    ]
  };


  site_02_data = {
    site_id: 'site_02',
    geocoordinates: [],
    simulations: [
      {
        sim_id: 'simulation_04',
        domain_dims: {
          units: 'km',
          width: 6.4,
          depth: 6.4,
          height: 3.0
        },
        duration: {
          hrs: 6,
          min: 0,
          sec: 0
        },
        time_steps: 180
      },
      {
        sim_id: 'simulation_05',
        domain_dims: {
          units: 'km',
          width: 6.4,
          depth: 6.4,
          height: 3.0
        },
        duration: {
          hrs: 4,
          min: 30,
          sec: 30
        },
        time_steps: 40
      },
    ]
  };


  // --------------------------------------------------------
  selectSimulationDataset(simdata) {
    this.setState({ 
      selectedDatasets: [...this.state.selectedDatasets, simdata] 
    })
  }

  // --------------------------------------------------------
  generateSiteSimulationList() {

  }

  // --------------------------------------------------------
  render() {
    console.log('selectedDatasets:', this.state.selectedDatasets);
    return (
      <>
        {
          this.state.hasLaunched ? <Viewer /> : 
          <div id='data-selection-container'>
            <div id='data-viewer-header'>
              <span>NIMBUS</span>
            </div>
            <div id='data-viewer-container'>
              <div id='dataset-list-view'>

                <div id='available-datasets'>
                  <span>Available Datasets ({ this.state.selectedDatasets.length } selected) </span>
                </div>

                <div>
                  <ul id='sites-list'>
              
                    <li className='site-list-item'>
                      <SiteSimulationsList 
                        selectSimulationDataset={ this.selectSimulationDataset.bind(this) }
                        siteData={ this.site_01_data } 
                      />
                    </li>

                    <li className='site-list-item'>
                      <SiteSimulationsList
                        selectSimulationDataset={ this.selectSimulationDataset.bind(this) } 
                        siteData={ this.site_02_data }
                      />
                    </li>

                  </ul>
                </div>
                <button>Launch</button>
              </div>
              <div id='map-view'></div>
            </div>
          </div> 
        }
      </>
    )
  }
}