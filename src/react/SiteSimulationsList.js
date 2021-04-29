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
          key={ `${ `site${ this.props.siteData['site_num'] }`}-${ simData.sim_id }-${ idx }` }
          simData={ simData }
          site_id={ `site${ this.props.siteData['site_num'] }` }
        />
      );
    });
  }

  // --------------------------------------------------------
  render() {
    return (
      <div className={`site-container ${ this.state.isExpanded ? 'expanded' : '' }`}>
        <div className='site-header' onClick={ this.toggleExpanded.bind(this) }>
          <span>{ `site${ this.props.siteData['site_num'] }` }</span>

          { this.state.isExpanded ? 
            <svg onClick={ this.toggleExpanded.bind(this) } className='icon-collapse' width="18" height="1" viewBox="0 0 18 1" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line y1="0.5" x2="18" y2="0.5" stroke="white"/>
            </svg>
            :
            <svg onClick={ this.toggleExpanded.bind(this) } className='icon-expand' width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 0C8.71596 0 8.48571 0.230271 8.48571 0.514286V8.48575H0.514286C0.230246 8.48575 0 8.71599 0 9.00003C0 9.28407 0.230246 9.51432 0.514286 9.51432H8.48571V17.4857C8.48571 17.7698 8.71596 18 9 18C9.28404 18 9.51429 17.7698 9.51429 17.4857V9.51432H17.4857C17.7698 9.51432 18 9.28407 18 9.00003C18 8.71599 17.7698 8.48575 17.4857 8.48575H9.51429V0.514286C9.51429 0.230271 9.28404 0 9 0Z" fill="white"/>
            </svg>
          }
        
        </div>
        <div className={`site-datasets-container ${ this.state.isExpanded ? 'expanded' : '' }`}>
          <ul className='site-datasets-list'>
            { this.generateSimulationListItems() }
          </ul>
        </div>
      </div>
    );
  }
}