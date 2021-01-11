import React, { Component } from 'react';
import SiteSimulationsListItem from './SiteSimulationListItem';

export default class SiteSimulationsList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isExpanded: false
    }
  }

  // --------------------------------------------------------
  toggleExpanded() {
    this.setState({
      isExpanded: !this.state.isExpanded
    });
  }

  // --------------------------------------------------------
  generateSimulationListItems() {
    return this.props.siteData.simulations.map((simData, idx) => {
      return (
        <SiteSimulationsListItem
          selectSimulationDataset={ this.props.selectSimulationDataset } 
          key={ `${ this.props.siteData['site_id'] }-${ simData.sim_id }-${ idx }` }
          simData={ simData }
          site_id={ this.props.siteData['site_id'] }
        />
      );
    });
  }

  // --------------------------------------------------------
  render() {
    return (
      <div className='site-container expanded'>
        <div className='site-header'>
          <span>Site 01</span>
        </div>
        <div className='site-datasets-container'>
          <ul className='site-datasets-list'>
            { this.generateSimulationListItems() }
          </ul>
        </div>
      </div>
    );
  }
}