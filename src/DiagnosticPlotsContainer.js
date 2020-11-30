import React from 'react';
import DiagnosticPlot from './DiagnosticPlot';
import DiagnosticYAxis from './DiagnosticYAxis';
import AltVariableScrubber from './AltVariableScrubber';
import Switch from './Switch';
import Dropdown from './Dropdown';

// BOMEX_1_DEFAULT data load
import bomex_1_default from './data/BOMEX_1_DEFAULT.json';
import bomex_2_default from './data/BOMEX_2_DEFAULT.json';

export default class DiagnosticPlotsContainer extends React.Component {

  // --------------------------------------------------------
  constructor(props) {
    super(props);

    // state variables
    this.state = {
      extentsOn : true,
      compareOn : false,

      // sets start range for scrubber to be the whole domain
      custom_range : {
        left: 0,
        right: 179
      },
      // sets inital variable for timeline
      currentAltVar : 'tke'
    };

    this.handleToggleCompareOn = this.handleToggleCompareOn.bind(this);
    this.handleToggleExtents = this.handleToggleExtents.bind(this);
    this.handleUpdateInterval = this.handleUpdateInterval.bind(this);
    this.handleChangeDropdownVar = this.handleChangeDropdownVar.bind(this)
  }

  // variable lists for dropdowns
  timeline_alt_vars = [
    "tke",
    "cld_base",
    "cld_cover",
    "cld_top",
    "u",
    "v",
    "w",
    "avg_rho",
    "rho",
    "qt",
    "ql",
    "thv",
    "thl",
    "temp",
    "pres",
    "thd",
    "ei",
    "et",
    "ht",
    "hi",
    "w_ht_sgs",
    "qv",
    "w_qt_sgs",
    "var_u",
    "var_v",
    "var_w",
    "w3",
    "tke",
    "var_qt",
    "var_thl",
    "var_ei",
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
    "cov_qt_thl",
    "cov_qt_ei",
    "cld_frac"
  ];

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

  datasets = [bomex_1_default, bomex_2_default];

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

            <div id='compare-toggle'>
              <span id='compare-label'>Compare</span>
              <Switch
                toggleName={ 'compare '}
                isOn={ this.state.compareOn }
                handleToggle={ this.handleToggleCompareOn }
              />
            </div>

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

          <div className='icon-container'>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M18.4145 19.1958L12.1534 19.1965C11.8451 19.1957 11.5952 19.4457 11.596 19.754C11.596 20.0614 11.8451 20.3106 12.1534 20.3114H19.7539C19.9021 20.3114 20.0432 20.2522 20.1481 20.1474C20.2521 20.0433 20.3113 19.9022 20.3113 19.754V12.1535C20.3113 11.999 20.2482 11.8602 20.1473 11.7593C20.0464 11.6584 19.9076 11.5953 19.7539 11.5961C19.4456 11.5953 19.1957 11.8452 19.1964 12.1535V18.4011L12.8633 12.068C12.754 11.9587 12.6113 11.9052 12.4686 11.9052C12.3258 11.9052 12.1831 11.9587 12.075 12.068C11.8564 12.2854 11.8564 12.6389 12.075 12.8563L18.4145 19.1958ZM1.89669 1.11554L8.15779 1.11484C8.46606 1.11563 8.716 0.865695 8.71521 0.557419C8.71521 0.249932 8.46606 0.000788444 8.15779 0H0.557337C0.409111 0 0.267982 0.0591324 0.16312 0.163993C0.0590477 0.268066 -8.39233e-05 0.409195 -8.39233e-05 0.557419V8.15787C-8.39233e-05 8.31241 0.0629921 8.45117 0.16391 8.55209C0.26483 8.65301 0.403593 8.71608 0.557337 8.71529C0.865612 8.71608 1.11554 8.46615 1.11475 8.15787V1.91023L7.44792 8.24339C7.55719 8.35266 7.69991 8.40618 7.84263 8.40618C7.98535 8.40618 8.12807 8.35266 8.23623 8.24339C8.45477 8.02597 8.45477 7.67251 8.23623 7.45508L1.89669 1.11554Z" fill="white"/>
            </svg>
          </div>
        </div>

        <div id='diagnostic-plots-inner'>
          <div id='diagnostic-plots'>
            <DiagnosticYAxis
              slice_type={ "HORIZONTAL" }
              altitude={ this.props.currentAltitude }
            />
            <DiagnosticPlot
              compareOn={ this.state.compareOn }
              extentsOn={ this.state.extentsOn }
              customRange={ this.state.custom_range }
              defaultVars={ this.default_vars1 }
              defaultVar={ this.default_vars1[5] }
              data={ this.datasets }
            />
            <DiagnosticPlot
              compareOn={ this.state.compareOn }
              extentsOn={ this.state.extentsOn }
              customRange={ this.state.custom_range }
              defaultVars={ this.default_vars2 }
              defaultVar={ this.default_vars2[9] }
              data={ this.datasets }
            />
            <DiagnosticPlot
              compareOn={ this.state.compareOn }
              extentsOn={ this.state.extentsOn }
              customRange={ this.state.custom_range }
              defaultVars={ this.default_vars3 }
              defaultVar={ this.default_vars3[3] }
              data={ this.datasets }
            />
            <DiagnosticPlot
              compareOn={ this.state.compareOn }
              extentsOn={ this.state.extentsOn }
              customRange={ this.state.custom_range }
              defaultVars={ this.default_vars4 }
              defaultVar={ this.default_vars4[0] }
              data={ this.datasets }
            />
          </div>
        </div>
        <div id='alt-var-scrubber-container'>
          <AltVariableScrubber
            currentAltVar={ this.state.currentAltVar }
            handleUpdateInterval={ this.handleUpdateInterval }
            customRange={ this.state.custom_range }
            data={ this.datasets }
          />
        </div>
      </div>
    )
  }
}
