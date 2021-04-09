import React, { Component } from 'react';
import SlicesContainer from './SlicesContainer';
import DiagnosticPlotsContainer from './DiagnosticPlotsContainer';

export default class Viewer extends Component {

  constructor(props) {
    super(props);

    // boolean for if volumetric data exists @ this.props.hasVolumetricData

    // --------------------------------------------------------
    // global state variables and funcions that get passed between components
    // --------------------------------------------------------


    this.state = {


      // Horizontal
      currentSliceType: 'HORIZONTAL',
      currentAltitude: this.props.simMetaData["z_extent"] / 2,

      // these two can go
      horizontalSliceRange: [0, this.props.simMetaData["z_extent"]],
      horizontalIncrement: this.props.simMetaData["z"][1] - this.props.simMetaData["z"][0],

      // Vertical
      currentVerticalAxis: 'X',
      currentVerticalX: this.props.simMetaData["x_extent"] / 2,
      currentVerticalY: this.props.simMetaData["y_extent"] / 2,

      // these two can go
      verticalSliceRange: [0, this.props.simMetaData["x_extent"]],
      verticalIncrement: this.props.simMetaData["x"][1] - this.props.simMetaData["x"][0],
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
    return (
      <div className="Viewer">
        {/* Don't render if !this.props.hasVolumetricData*/}
        <SlicesContainer

          selectedDatasets={ this.props.selectedDatasets }
          simMetaData={ this.props.simMetaData }

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
