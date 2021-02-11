import React, { Component } from 'react';
import SlicesContainer from './SlicesContainer';
import DiagnosticPlotsContainer from './DiagnosticPlotsContainer';

// SlicesContainer data
import BOMEX_AUX_DATA from './data/BOMEX_3D_aux_100-104'
import BOMEX_DATA from './data/BOMEX_3D_100-104'
import BOMEX_coords from './data/BOMEX_3D_coord_data';


export default class Viewer extends Component {

  constructor(props) {
    super(props);

    // --------------------------------------------------------
    // global state variables and funcions that get passed between components
    // --------------------------------------------------------
    this.state = {
      // Horizontal
      currentSliceType: 'HORIZONTAL',
      currentAltitude: 1200,

      // these two can go
      horizontalSliceRange: [0, 3000],
      horizontalIncrement: 40,

      // Vertical
      currentVerticalAxis: 'X',
      currentVerticalX: 3000,
      currentVerticalY: 3000,

      // these two can go
      verticalSliceRange: [0, 6400],
      verticalIncrement: 100,
    }

    this.handleUpdateAltitude     = this.handleUpdateAltitude.bind(this);
    this.handleSelectTab          = this.handleSelectTab.bind(this);
    this.handleUpdateVerticalX    = this.handleUpdateVerticalX.bind(this);
    this.handleUpdateVerticalY    = this.handleUpdateVerticalY.bind(this);
    this.handleToggleVerticalAxis = this.handleToggleVerticalAxis.bind(this)

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
  render() {
    console.log('[Viewer.js] this.props: ', this.props);

    return (
      <div className="Viewer">
        <SlicesContainer

          simMetaData={ this.props.simMetaData }

          BOMEX_AUX_DATA={ BOMEX_AUX_DATA }
          BOMEX_DATA={ BOMEX_DATA }
          BOMEX_coords={ BOMEX_coords }

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
          simMetaData={ this.props.simMetaData }
          simDiagnosticData={ this.props.simDiagnosticData }
          currentAltitude={ this.state.currentAltitude }
        />
      </div>
    );
  }
}
