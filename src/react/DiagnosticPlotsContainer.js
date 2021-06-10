import React from 'react';
import DiagnosticPlot from './DiagnosticPlot';
import DiagnosticYAxis from './DiagnosticYAxis';
import AltVariableScrubber from './AltVariableScrubber';
import Switch from './Switch';
import Dropdown from './Dropdown';

export default class DiagnosticPlotsContainer extends React.Component {

  // --------------------------------------------------------
  constructor(props) {
    super(props);

    // state variables
    this.state = {
      extentsOn : true,
      compareOn : false,

      timeStamps : this.props.simMetaData["diagnostic_time_stamps"],
      // sets start range for scrubber to be the whole domain
      custom_range : {
        left: 0,
        right: this.props.simMetaData["diagnostic_num_time_stamps"]
      },
      // sets inital variable for timeline
      currentAltVar : 'tke'
    };

    this.handleToggleCompareOn = this.handleToggleCompareOn.bind(this);
    this.handleToggleExtents = this.handleToggleExtents.bind(this);
    this.handleUpdateInterval = this.handleUpdateInterval.bind(this);
    this.handleChangeDropdownVar = this.handleChangeDropdownVar.bind(this)
  }
  //possible variables
  timeline_alt_vars = this.props.simMetaData["diagnostic_variables"]


  // variables displayed in drop downs (temporary)
  // replace when scroll is added to the selection menu
  default_timeline_alt_vars = [
    "tke",
    "cld_frac",
    "ql"
  ];

  default_vars1 = [
    "u",
    "v",
    "w",
    "rho",
    "qt",
    "ql",
    "ei",
    "et",
    "ht",
    "hi",
    "qv",
  ];

  default_vars2 = [
    "temp",
    "pres",
    "avg_rho",
    "thv",
    "thl",
    "thd",
    "w_ht_sgs",
    "w_qt_sgs",
    "w3",
    "cld_frac",
    "tke"
  ]

  default_vars3 = [
    "var_u",
    "var_v",
    "var_w",
    "var_qt",
    "var_thl",
    "var_ei",
  ]

  default_vars4 = [
    "cov_w_u",
    "cov_w_v",
    "cov_w_rho",
    "cov_w_qt",
    "cov_w_ql",
    "cov_w_qv",
    "cov_w_thd",
    "cov_w_thv",
    "cov_w_thl",
    "cov_w_ei",
    "cov_qt_thl"
  ]

  // --------------------------------------------------------
  handleChangeDropdownVar = item => {
    this.setState({
      currentAltVar: item
    })
  }

  // --------------------------------------------------------
  handleToggleExtents = (e) => {
    this.setState({
      extentsOn: !this.state.extentsOn
    });
  }

  // --------------------------------------------------------
  handleToggleCompareOn = (e) => {
    this.setState({
      compareOn: !this.state.compareOn
    });
  }

  // --------------------------------------------------------
 // this function gets called whenever the brush on the timeline is moved, and it updates
 // the state variable which in turn updates each diagnostic plot
  // --------------------------------------------------------
  handleUpdateInterval = (boundingStart, boundingEnd) => {

    if(Math.abs(this.state.custom_range.left - boundingStart) > 1 || Math.abs(this.state.custom_range.right - boundingEnd) > 1 ) {
      this.setState({
        custom_range : {
          left: boundingStart,
          right: boundingEnd
        }
      })
    }
  }

  // --------------------------------------------------------
  // renders elements
  // --------------------------------------------------------
  render() {
    console.log('[DiagnosticPlotsContainer.js] this.props: ', this.props);
    return (
      <div id='diagnostic-plots-container'>
        <div className='section-header diagnostic-plots-header'>
          <div id='diagnostic-plot-ctls'>

            <div id='diag-alt-var-dropdown'>
              <span id='alt-var-label'>TLV</span>
              <Dropdown
                default_var={ this.default_timeline_alt_vars[0] }
                items={ this.default_timeline_alt_vars }
                onChange={ this.handleChangeDropdownVar }
              />
            </div>

            <div id='extents-toggle'>
              <span id='extents-label'>Extents</span>
              <Switch
                toggleName={ 'extents' }
                isOn={ this.state.extentsOn }
                handleToggle={ this.handleToggleExtents }
              />
            </div>

            {/* <div id='compare-toggle'>
              <span id='compare-label'>Compare</span>
              <Switch
                toggleName={ 'compare '}
                isOn={ this.state.compareOn }
                handleToggle={ this.handleToggleCompareOn }
              />
            </div> */}

            {
              this.state.compareOn ?
              <div id='diagnostic-data-legend'>
                <div className="diagnostic-legend">
                  <div className="diagnostic-color bomex-1"></div>
                  <span className='diagnostic-data-label'>BOMEX_1</span>
                </div>
                <div className="diagnostic-legend">
                  <div className="diagnostic-color bomex-2"></div>
                  <span className='diagnostic-data-label'>BOMEX_2</span>
                </div>
                <div className="icon-plus">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="5.04541" y1="2.40413e-08" x2="5.04541" y2="10" stroke="white"/>
                    <line y1="4.95508" x2="10" y2="4.95508" stroke="white"/>
                  </svg>
                </div>
              </div> : null
            }


          </div>
        </div>

        <div id='diagnostic-plots-inner'>
          <div id='diagnostic-plots'>
            <DiagnosticYAxis
              slice_type={ "HORIZONTAL" }
              altitude={ this.props.currentAltitude }
              metaData={ this.props.simMetaData }
            />
            <DiagnosticPlot
              compareOn={ this.state.compareOn }
              extentsOn={ this.state.extentsOn }
              customRange={ this.state.custom_range }
              defaultVars={ this.default_vars1 }
              defaultVar={ this.default_vars1[5] }
              data={ this.props.simDiagnosticData }
              metaData={ this.props.simMetaData }
            />
            <DiagnosticPlot
              compareOn={ this.state.compareOn }
              extentsOn={ this.state.extentsOn }
              customRange={ this.state.custom_range }
              defaultVars={ this.default_vars2 }
              defaultVar={ this.default_vars2[9] }
              data={ this.props.simDiagnosticData }
              metaData={ this.props.simMetaData }
            />
            <DiagnosticPlot
              compareOn={ this.state.compareOn }
              extentsOn={ this.state.extentsOn }
              customRange={ this.state.custom_range }
              defaultVars={ this.default_vars3 }
              defaultVar={ this.default_vars3[3] }
              data={ this.props.simDiagnosticData }
              metaData={ this.props.simMetaData }
            />
            <DiagnosticPlot
              compareOn={ this.state.compareOn }
              extentsOn={ this.state.extentsOn }
              customRange={ this.state.custom_range }
              defaultVars={ this.default_vars4 }
              defaultVar={ this.default_vars4[0] }
              data={ this.props.simDiagnosticData }
              metaData={ this.props.simMetaData }
            />
          </div>
        </div>
        <div id='alt-var-scrubber-container'>
          <AltVariableScrubber
            timeStamps= { this.state.timeStamps }
            currentAltVar={ this.state.currentAltVar }
            handleUpdateInterval={ this.handleUpdateInterval }
            customRange={ this.state.custom_range }
            data={ this.props.simDiagnosticData }
          />
        </div>
      </div>
    )
  }
}
