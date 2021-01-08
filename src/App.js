import React, { Component } from 'react';
import './App.css';
import Viewer from './Viewer';

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedDatasets: [],
      hasLaunched: false
    }
  }

  sampleData = {
    simulation_01: {
      dimensions: {
        units: 'km',
        width: 6.4,
        height: 3.0,
        depth: 6.4
      },
      duration: {
        hrs: 6,
        min: 0,
        sec: 0
      },
      timesteps: 180
    }
  }

  // --------------------------------------------------------
  render() {
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
                    {/* site 01 */}
                    <li className='site-list-item'>
                      <div className='site-container expanded'>
                        <div className='site-header'>
                          <span>Site 01</span>
                        </div>
                        <div className='site-datasets-container'>
                          <ul className='site-datasets-list'>
                           
                            <li className='site-dataset-item'>
                              <div className='dataset-item-container'>
                                <div>
                                  <span className='simulation-id-label'>simulation_01</span>
                                </div>
                                <div className='simulation-meta'>
                                  domain dimensions: 6.4km x 6.4km x 3.0km<br/>
                                  duration (h/m/s): 06:00:00<br/>
                                  time steps: 180
                                </div>
                              </div>
                            </li>

                            <li className='site-dataset-item'>
                              <div className='dataset-item-container'>
                                <div>
                                  <span className='simulation-id-label'>simulation_01</span>
                                </div>
                                <div className='simulation-meta'>
                                  domain dimensions: 6.4km x 6.4km x 3.0km<br/>
                                  duration (h/m/s): 06:00:00<br/>
                                  time steps: 180
                                </div>
                              </div>
                            </li>

                            <li className='site-dataset-item'>
                              <div className='dataset-item-container'>
                                <div>
                                  <span className='simulation-id-label'>simulation_01</span>
                                </div>
                                <div className='simulation-meta'>
                                  domain dimensions: 6.4km x 6.4km x 3.0km<br/>
                                  duration (h/m/s): 06:00:00<br/>
                                  time steps: 180
                                </div>
                              </div>
                            </li>

                          </ul>
                        </div>
                        
                      </div>
                    </li>

                    {/* site 02 */}

                    <li className='site-list-item'>
                      <div className='site-container'>
                        <div className='site-header'>
                          <span>Site 02</span>
                        </div>
                        <div className='site-datasets-container'>
                          <ul className='site-datasets-list'>
                           
                            <li className='site-dataset-item'>
                              <div className='dataset-item-container'>
                                <div>
                                  <span className='simulation-id-label'>simulation_01</span>
                                </div>
                                <div className='simulation-meta'>
                                  domain dimensions: 6.4km x 6.4km x 3.0km<br/>
                                  duration (h/m/s): 06:00:00<br/>
                                  time steps: 180
                                </div>
                              </div>
                            </li>
                          </ul>
                        </div>
                        
                      </div>
                    </li>

                   
                  </ul>
                </div>
                
              </div>
              <div id='map-view'></div>
            </div>
          </div> 
        }
      </>
    )
  }
}