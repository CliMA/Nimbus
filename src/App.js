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
  render() {
    return (
      <>
        {
          this.state.simMetaData && this.state.simDiagnosticData ? 
            <Viewer
              simDiagnosticData={ this.state.simDiagnosticData }
              simMetaData={ this.state.simMetaData }
            /> : 
          <div id='data-selection-container'>
            <div id='user-settings-modal' className={ this.state.userSettingsModalOpen ? 'visible' : '' }>
              <span>User directory:</span> 
              <div id='user-directory-container'>
                <span>{ this.state.userDirectory }</span>
              </div>
            </div>
            <div id='data-viewer-header'>
              <span>NIMBUS</span>
            </div>
            <div id='data-viewer-container'>
              <div id='dataset-list-view'>

                <div id='available-datasets'>
                  <span>Available Datasets ({ this.state.selectedDatasets.length } selected)</span>
                  <svg onClick={ this.toggleUserSettingsModal.bind(this) }id='icon-user-settings' width="24" height="24" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M25.2345 10.4711L22.3365 9.97897C22.1724 9.45952 21.9537 8.9674 21.7077 8.47529L23.4027 6.09674C23.6488 5.74132 23.6215 5.24921 23.3207 4.94848L20.9968 2.62461C20.6961 2.32387 20.204 2.26919 19.8486 2.54259L17.47 4.23764C17.0053 3.99159 16.4858 3.77287 15.9664 3.60883L15.5016 0.73817C15.4196 0.300736 15.0641 0 14.6267 0H11.346C10.9085 0 10.5531 0.300736 10.4711 0.73817L9.97897 3.63617C9.45952 3.80021 8.9674 4.01893 8.47529 4.26498L6.09674 2.56993C5.74132 2.32387 5.24921 2.35121 4.94848 2.65195L2.62461 4.97582C2.32387 5.27655 2.26919 5.76866 2.54259 6.12408L4.23764 8.50263C3.99159 8.9674 3.77287 9.48686 3.60883 10.0063L0.73817 10.4711C0.300736 10.5531 0 10.9085 0 11.346V14.6267C0 15.0641 0.300736 15.4196 0.73817 15.5016L3.63617 15.9937C3.80021 16.5131 4.01893 17.0053 4.26498 17.4974L2.56993 19.8759C2.32387 20.2313 2.35121 20.7234 2.65195 21.0242L4.97582 23.3481C5.27655 23.6488 5.76866 23.7035 6.12408 23.4301L8.50263 21.735C8.9674 21.9811 9.48686 22.1998 10.0063 22.3638L10.4984 25.2618C10.5804 25.6993 10.9359 26 11.3733 26H14.654C15.0915 26 15.4469 25.6993 15.5289 25.2618L15.9937 22.3365C16.5131 22.1724 17.0053 21.9537 17.4974 21.7077L19.8759 23.4027C20.2313 23.6488 20.7234 23.6215 21.0242 23.3207L23.3481 20.9968C23.6488 20.6961 23.7035 20.204 23.4301 19.8486L21.735 17.47C21.9811 17.0053 22.1998 16.4858 22.3638 15.9664L25.2618 15.4742C25.6993 15.3922 26 15.0368 26 14.5994V11.346C25.9727 10.9085 25.6719 10.5531 25.2345 10.4711ZM12.9863 17.6614C10.3891 17.6614 8.31125 15.5563 8.31125 12.9863C8.31125 10.3891 10.4164 8.31125 12.9863 8.31125C15.5563 8.31125 17.6614 10.3891 17.6614 12.9863C17.6614 15.5836 15.5836 17.6614 12.9863 17.6614Z" fill="black"/>
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
                <WorldMap />
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