import React, { Component } from 'react';
import './App.css';
import SlicesContainer from './SlicesContainer';
import DiagnosticPlotsContainer from './DiagnosticPlotsContainer';
import { channels } from '../shared/constants';
const { ipcRenderer } = window; 


export default class App extends Component {

  constructor(props) {
    super(props);

    // --------------------------------------------------------
    // global state variables and funcions that get passed between components
    // --------------------------------------------------------
    this.state = {

      // Electron
      appName: '',
      appVersion: '',

      // Horizontal
      currentSliceType: 'HORIZONTAL',
      currentAltitude: 1200,
      horizontalSliceRange: [0, 3000],
      horizontalIncrement: 40,

      // Vertical
      currentVerticalAxis: 'X',
      currentVerticalX: 3000,
      currentVerticalY: 3000,
      verticalSliceRange: [0, 6400],
      verticalIncrement: 100,
    }

    this.handleUpdateAltitude     = this.handleUpdateAltitude.bind(this);
    this.handleSelectTab          = this.handleSelectTab.bind(this);
    this.handleUpdateVerticalX    = this.handleUpdateVerticalX.bind(this);
    this.handleUpdateVerticalY    = this.handleUpdateVerticalY.bind(this);
    this.handleToggleVerticalAxis = this.handleToggleVerticalAxis.bind(this);

    // ELECTRON
    ipcRenderer.send(channels.APP_INFO);
    ipcRenderer.on(channels.APP_INFO, (event, arg) => {
      ipcRenderer.removeAllListeners(channels.APP_INFO);
      const { appName, appVersion } = arg;
      this.setState({ appName, appVersion });
    });

  }

  // --------------------------------------------------------
  handleSelectTab(tabType) {
    if (tabType !== this.state.currentSliceType) {
      this.setState({
        currentSliceType: tabType
      });
    }
  }

  // --------------------------------------------------------
  handleUpdateAltitude = (e) => {
    console.log('updating altitude:');
    this.setState({ currentAltitude: e.target.value });
  };

  // --------------------------------------------------------
  handleUpdateVerticalX = (e) => {
    this.setState({ currentVerticalX: e.target.value });
  };

  // --------------------------------------------------------
  handleUpdateVerticalY = (e) => {
    this.setState({ currentVerticalY: e.target.value });
  };

  // --------------------------------------------------------
  handleToggleVerticalAxis = (axis) => {
    this.setState({ currentVerticalAxis: axis });
  }

  // --------------------------------------------------------
  // overall app structure
  // --------------------------------------------------------
  render() {
    return (
      <div className="App">
        <SlicesContainer
          horizontalSliceRange={ this.state.horizontalSliceRange }
          horizontalIncrement={ this.state.horizontalIncrement }
          verticalSliceRange={ this.state.verticalSliceRange }
          verticalIncrement={ this.state.verticalIncrement }

          currentSliceType={ this.state.currentSliceType }
          currentAltitude={ this.state.currentAltitude }
          currentVerticalAxis={ this.state.currentVerticalAxis }
          currentVerticalX={ this.state.currentVerticalX }
          currentVerticalY={ this.state.currentVerticalY }

          handleSelectTab={ this.handleSelectTab }
          handleUpdateAltitude={ this.handleUpdateAltitude }
          handleUpdateVerticalX={ this.handleUpdateVerticalX }
          handleUpdateVerticalY={ this.handleUpdateVerticalY }
          handleToggleVerticalAxis={ this.handleToggleVerticalAxis }

        />
        <DiagnosticPlotsContainer
          currentAltitude={ this.state.currentAltitude }
        />
      </div>
    );
  }
}
