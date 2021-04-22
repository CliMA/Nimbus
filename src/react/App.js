import React, { Component } from 'react';
import './App.css';
import Viewer from './Viewer';
import WorldMap from './WorldMap';
import SiteSimulationsList from './SiteSimulationsList';
import axios from 'axios';

export default class App extends Component {

  // --------------------------------------------------------
  constructor(props) {
    super(props);

    this.state = {
      selectedDatasets: [],
      userSettingsModalOpen: false,
      hasLaunched: false // not being used rn
    }
  }


  // --------------------------------------------------------
  componentDidMount() {

    axios.get('/dbMetadataList')
      .then(res => {
        this.setState({
          dbMetadataList: res.data
        });
      })
      .catch(e => {
        console.log('/dbMetadataList error: ', e);
      });

    axios.get('/userDirectoryPath')
      .then(res => {
        this.setState({
          userDirectory: res.data['user_directory']
        });
      });
  }


  // --------------------------------------------------------
  // For now this requests only one simulation but should be
  // rewritten for multiple
  getSimulationData() {

    // right now these are two separate calls, can they be
    // combined into one?

    axios.get('/simMetaFile', {
      params: {
        sim: this.state.selectedDatasets[0]
      }
    }).then(res => {
      this.setState({
        simMetaData: res.data
      })
    }).catch(e => {
      console.log('/simMetaFile error: ', e);
    });


    axios.get('/simDiagnosticFile', {
      params: {
        sim: this.state.selectedDatasets[0]
      }
    }).then(res => {
      this.setState({
        simDiagnosticData: res.data
      })
    }).catch(e => {
      console.log('/simDiagnosticFile error: ', e);
    });
  }
  


  // --------------------------------------------------------
  generateSiteSimulationsList() {

    return this.state.dbMetadataList['sites'].map(siteMetadata => {
      return (
        <li className='site-list-item' key={ `site${ siteMetadata['site_num']} `}>
          <SiteSimulationsList
            selectSimulationDataset={ this.selectSimulationDataset.bind(this) }
            siteData={ siteMetadata }
          />
        </li>
      );
    })
  }


  // --------------------------------------------------------
  selectSimulationDataset(simdata) {

    // This could probably be more efficient
    let idx = this.state.selectedDatasets.findIndex(data => data['selection_id'] === simdata['selection_id']);

    if (idx === -1) {
      // not found, add it
      this.setState({
        selectedDatasets: [...this.state.selectedDatasets, simdata]
      })
    } else {
      // nothing found so we add it
      let updatedSelection = this.state.selectedDatasets;
      updatedSelection.splice(idx, 1);
      this.setState({
        selectedDatasets: updatedSelection
      });
    }
  }


  // --------------------------------------------------------
  toggleUserSettingsModal() {
    this.setState({
      userSettingsModalOpen: !this.state.userSettingsModalOpen
    });
  }


  // --------------------------------------------------------
  // Only handles when a new one has been selected from file, 
  // browser, has not yet been 'confirmed' by user
  onChangeDBFile = (e) => {
    console.log('here');
    e.stopPropagation();
    e.preventDefault();
    let file = e.target.files[0];
    console.log(file);
    // this.setState({file}); /// if you want to upload latter
  }


  // --------------------------------------------------------
  render() {
    return (
      <>
        {
          this.state.simMetaData && this.state.simDiagnosticData ?
            <Viewer
              selectedDatasets={ this.state.selectedDatasets }
              simDiagnosticData={ this.state.simDiagnosticData }
              simMetaData={ this.state.simMetaData }
              simDiagnosticBSON={ this.state.simDiagnosticBSON }
              hasVolumetricData= { this.state.simMetaData["vol"] }
            /> :
          <div id='data-selection-container'>

            <div id='user-settings-darken' className={ this.state.userSettingsModalOpen ? 'visible' : '' }></div>
            <div id='user-settings-modal' className={ this.state.userSettingsModalOpen ? 'visible' : '' }>
              <div id='user-settings-header'>
                <span>Settings</span>
                <div 
                  id='icon-settings-close-container'
                  onClick={ () => this.toggleUserSettingsModal() }
                >
                  <svg id='icon-settings-close' width="74" height="74" viewBox="0 0 74 74" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M68.3999 1.59922L39.0999 30.8992C37.8999 32.0992 35.9999 32.0992 34.8999 30.8992L5.5999 1.59922C4.3999 0.399219 2.4999 0.399219 1.3999 1.59922C0.199902 2.79922 0.199902 4.69922 1.3999 5.79922L30.6999 35.0992C31.8999 36.2992 31.8999 38.1992 30.6999 39.2992L1.2999 68.6992C0.0999023 69.8992 0.0999023 71.7992 1.2999 72.8992C2.4999 74.0992 4.3999 74.0992 5.4999 72.8992L34.7999 43.5992C35.9999 42.3992 37.8999 42.3992 38.9999 43.5992L68.3999 72.9992C69.5999 74.1992 71.4999 74.1992 72.5999 72.9992C73.7999 71.7992 73.7999 69.8992 72.5999 68.7992L43.3999 39.3992C42.1999 38.1992 42.1999 36.2992 43.3999 35.1992L72.6999 5.89922C73.8999 4.69922 73.8999 2.79922 72.6999 1.69922C71.4999 0.499218 69.5999 0.499219 68.3999 1.59922Z" fill="white"/>
                  </svg>
                </div>
                
              </div>
              <div id='user-db-container'>
                <span>Database location:</span>
                <div id='user-db-path-container'>
                  <span id='user-db-path'>
                    { this.state.userDirectory }
                  </span>
                </div>
                <div id='user-db-update-container'>
                  {/* <button>Update</button> */}
                  <form>
                    <input 
                      type="file" 
                      id="db-file" 
                      onChange={ this.onChangeDBFile.bind(this) }
                      multiple required 
                    />
                    <label id='select-db' htmlFor="db-file">Choose database file</label>
                    <div id="db-filename"></div>
                  </form>
                </div>
              </div>
            </div>


            <div id='data-viewer-header'>
              <span>NIMBUS</span>
            </div>
            <div id='data-viewer-container'>
              <div id='dataset-list-view'>

                <div id='available-datasets'>
                  <span>Available Datasets ({ this.state.selectedDatasets.length } selected)</span>

                  <svg onClick={ this.toggleUserSettingsModal.bind(this) } id='icon-user-settings'  width="5" height="24" viewBox="0 0 5 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.90476 11.7071C2.95673 11.7071 3.80952 10.8335 3.80952 9.75591C3.80952 8.67828 2.95673 7.80469 1.90476 7.80469C0.852791 7.80469 0 8.67828 0 9.75591C0 10.8335 0.852791 11.7071 1.90476 11.7071Z" fill="white"/>
                    <path d="M1.90476 3.90244C2.95673 3.90244 3.80952 3.02885 3.80952 1.95122C3.80952 0.873591 2.95673 0 1.90476 0C0.852791 0 0 0.873591 0 1.95122C0 3.02885 0.852791 3.90244 1.90476 3.90244Z" fill="white"/>
                    <path d="M1.90476 19.5118C2.95673 19.5118 3.80952 18.6382 3.80952 17.5606C3.80952 16.483 2.95673 15.6094 1.90476 15.6094C0.852791 15.6094 0 16.483 0 17.5606C0 18.6382 0.852791 19.5118 1.90476 19.5118Z" fill="white"/>
                  </svg>                  
                </div>

                <div id='full-site-list'>
                  <ul id='sites-list'>
                    {
                      this.state.dbMetadataList ? this.generateSiteSimulationsList() : null
                    }
                  </ul>
                </div>

              </div>
              <div id='map-view'>
                <WorldMap
                  dbMetadataList={ this.state.dbMetadataList }
                />
                <button
                  id='btn-launch'
                  onClick={ this.getSimulationData.bind(this) }
                  disabled={ this.state.selectedDatasets.length > 0 ? false : true }>
                    Launch
                </button>
              </div>
            </div>
          </div>
        }
      </>
    )
  }
}
