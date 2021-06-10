import React, { Component } from 'react';
import HorizontalSlice from './HorizontalSlice';
import VerticalSlice from './VerticalSlice';
import TimelineScrubber from './TimelineScrubber';
import BoxController from './BoxController';
import axios from 'axios';
import * as d3 from 'd3';

export default class SlicesContainer extends Component {

  // 1 for full res
  // 2 for half res
  // 4 for quarter res
  // 8 for eighth res
  data_resolution = 2;
  
  dims = {
    "x" : this.props.simMetaData["x_extent"],
    "y" : this.props.simMetaData["y_extent"],
    "z" : this.props.simMetaData["z_extent"]
  };

  var_opts = this.props.simMetaData["volumetric_variables"];

  // --------------------------------------------------------
  // Utilities
  // --------------------------------------------------------
  colors = [
    "#023858", "#045a8d", "#0570b0",
    "#3690c0", "#74a9cf", "#a6bddb",
    "#d0d1e6", "#fff", "#fed976",
    "#feb24c", "#fd8d3c", "#fc4e2a",
    "#e31a1c", "#bd0026", "#800026"
  ];

  linearColorScale = d3.scaleLinear()
    .domain(d3.range(0,1,1 / this.colors.length))
    .range(this.colors)
    .interpolate(d3.interpolateLab);


  // --------------------------------------------------------
  constructor(props) {
    super(props);

    this.state = {
      timeStamps: this.props.simMetaData["volumetric_time_stamps"],
      currentTime: 0,
      timeRange: [0, this.props.simMetaData["volumetric_time_stamps"].length - 1], // number of files loaded in
      timeIncrement: 1, // increment for time scrubber
    };

    this.positivify       = this.positivify.bind(this);
    this.handleUpdateTime = this.handleUpdateTime.bind(this);
  }

  // --------------------------------------------------------
  componentDidMount() {

    axios.get('/volDataForTSRange', {
      params: {
        sim: this.props.selectedDatasets[0],
        samplingRes: this.data_resolution,
        tsRange: this.props.simMetaData["volumetric_time_stamps"].length,
        tsStarting: 1  
      }
    }).then(res => {
      // this.boxes = this.compile_vol_data(res);
      // console.log(this.boxes);
      this.setState({
        boxes: this.compile_vol_data(res)
      });
    }).catch(e => {
      console.log('/volDataForTSRange error: ', e);
    });
  }

  // --------------------------------------------------------
  positivify(data) {
    let newData;
    let min = d3.min(data);
    if(min <= 0) {
      newData = data.map(d => d - min + 1);
      return newData;
    } else {
      return data;
    }
  }

  // --------------------------------------------------------
  compile_vol_data(vol_data) {

    let boxes = {};
    for (let m=0; m<this.var_opts.length; m++) {
      let k = this.var_opts[m];
      let var_data = [];
      for (let i=0; i<vol_data.data.length; i++) {
        let s = vol_data.data[i];
        let time_stamp = [];
        for (let j=0; j<s.length; j++) {
          time_stamp = time_stamp.concat(s[j][k]);
        }
        var_data.push(time_stamp);
      }
      boxes[k] = var_data;
    }
    return boxes;
  }

  // --------------------------------------------------------
  handleUpdateTime = (e) => {
    this.setState({ currentTime: parseInt(e.target.value) });
  };

  // --------------------------------------------------------
  renderHeader() {
    return <div className='section-header simulation-header'>
      {/* Globe icon */}
      <svg className='globe-icon-svg' width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.99994 0C4.48094 0 0 4.4809 0 9.99992C0 15.4242 4.32942 19.8396 9.71768 19.9898C9.81036 19.9992 9.90552 19.9998 9.99994 19.9998C10.0944 19.9998 10.1895 19.9998 10.2822 19.9898C15.6705 19.8396 19.9999 15.4242 19.9999 9.99992C19.9999 4.4809 15.5189 0 9.99994 0ZM9.67736 0.675419V5.48384H6.05841C6.2768 4.67487 6.54631 3.9335 6.86486 3.29637C7.63321 1.75967 8.63024 0.833966 9.67736 0.675419ZM10.3225 0.675419C11.3696 0.833966 12.3666 1.75967 13.135 3.29637C13.4536 3.9335 13.7231 4.67487 13.9415 5.48384H10.3225V0.675419ZM7.8326 0.907252C7.24296 1.42754 6.72173 2.14112 6.29028 3.00401C5.92735 3.72985 5.62864 4.57239 5.39313 5.48384H1.80444C3.06021 3.21027 5.23845 1.52222 7.8326 0.907252ZM12.1673 0.907252C14.7614 1.52222 16.9397 3.21027 18.1954 5.48384H14.6067C14.3712 4.57239 14.0725 3.72985 13.7096 3.00401C13.2781 2.14112 12.7569 1.42754 12.1673 0.907252ZM1.48186 6.12899H5.23184C4.99687 7.22792 4.86916 8.42288 4.84874 9.67734H0.655222C0.698738 8.41498 0.986994 7.21583 1.48186 6.12899V6.12899ZM5.89712 6.12899H9.67736V9.67734H5.4939C5.51519 8.41488 5.65471 7.21696 5.89712 6.12899ZM10.3225 6.12899H14.1028C14.3452 7.21696 14.4846 8.41488 14.506 9.67734H10.3225V6.12899ZM14.768 6.12899H18.518C19.0129 7.21583 19.3011 8.41498 19.3447 9.67734H15.1511C15.1308 8.42288 15.003 7.22792 14.768 6.12899ZM0.655222 10.3225H4.84874C4.86907 11.5742 4.9979 12.7759 5.23184 13.8709H1.48186C0.988413 12.7843 0.697802 11.5841 0.655222 10.3225V10.3225ZM5.4939 10.3225H9.67736V13.8709H5.89712C5.65448 12.7844 5.51513 11.5858 5.4939 10.3225ZM10.3225 10.3225H14.506C14.4847 11.5858 14.3454 12.7844 14.1028 13.8709H10.3225V10.3225ZM15.1511 10.3225H19.3447C19.3021 11.5841 19.0115 12.7843 18.518 13.8709H14.768C15.002 12.7759 15.1309 11.5742 15.1511 10.3225ZM1.80444 14.516H5.39313C5.62871 15.4263 5.92709 16.2595 6.29028 16.9858C6.72396 17.8532 7.24928 18.5794 7.84269 19.1027C5.24142 18.489 3.06108 16.7963 1.80444 14.516V14.516ZM6.05841 14.516H9.67736V19.3346C8.63024 19.1745 7.63321 18.2302 6.86486 16.6935C6.54631 16.0563 6.2768 15.3232 6.05841 14.516ZM10.3225 14.516H13.9415C13.7231 15.3232 13.4536 16.0563 13.135 16.6935C12.3666 18.2302 11.3696 19.1745 10.3225 19.3346V14.516ZM14.6067 14.516H18.1954C16.9388 16.7963 14.7585 18.489 12.1572 19.1027C12.7506 18.5794 13.2759 17.8532 13.7096 16.9858C14.0728 16.2595 14.3712 15.4263 14.6067 14.516V14.516Z" fill="#ECECEC"/>
        
      </svg>
      <span className='section-header-label'>LES</span>
    </div>
  }

  // --------------------------------------------------------
  renderSliceHeaderTabs() {
    return <div className='slice-column-tabs-container'>
      <div
        onClick={ () => this.props.handleSelectTab('HORIZONTAL') }
        className={`slice-column-tab ${this.props.currentSliceType === 'HORIZONTAL' ? 'active-slice' : '' }`}
      >
        <span className='slice-column-label'>Horizontal</span>
      </div>
      <div
        onClick={ () => this.props.handleSelectTab('VERTICAL') }
        className={`slice-column-tab ${this.props.currentSliceType === 'VERTICAL' ? 'active-slice' : '' }`}
      >
        <span className='slice-column-label'>Vertical</span>
      </div>
    </div>
  }

  // --------------------------------------------------------
  renderCurrentSliceView() {
    console.log('[ renderCurrentSliceView ] boxes: ', this.state.boxes);
    if (this.props.currentSliceType === 'HORIZONTAL') {
      return (
        <div className='slice-container-inner'>
          <HorizontalSlice
            current_time={ this.state.currentTime }
            altitude={ this.props.currentAltitude }
            contour_var={ this.var_opts[0] }
            contour_var_opts={ this.var_opts }
            boxes_span={ this.state.boxes }
            positivify={ this.positivify }
            linearColorScale={ this.linearColorScale }
            dims={ this.dims }
          />

          <HorizontalSlice
            current_time={ this.state.currentTime }
            altitude={ this.props.currentAltitude }
            contour_var={ this.var_opts[0] }
            contour_var_opts={ this.var_opts }
            boxes_span={ this.state.boxes }
            positivify={ this.positivify }
            linearColorScale={ this.linearColorScale }
            dims={ this.dims }
          />

          <HorizontalSlice
            current_time={ this.state.currentTime }
            altitude={ this.props.currentAltitude }
            contour_var={ this.var_opts[0] }
            contour_var_opts={ this.var_opts }
            boxes_span={ this.state.boxes }
            positivify={ this.positivify }
            linearColorScale={ this.linearColorScale }
            dims={ this.dims }
          />
        </div>
      )
    } 

    return (
      <div className='slice-container-inner'>
        <VerticalSlice
          currentVerticalAxis={ this.props.currentVerticalAxis }
          currentVerticalX={ this.props.currentVerticalX }
          currentVerticalY={ this.props.currentVerticalY }
          current_time={ this.state.currentTime }
          contour_var={ this.var_opts[0] }
          contour_var_opts={ this.var_opts }
          boxes_span={ this.state.boxes }
          positivify={ this.positivify }
          linearColorScale={ this.linearColorScale }
          dims={ this.dims }
          res={ this.data_resolution }
        />
        <VerticalSlice
          currentVerticalAxis={ this.props.currentVerticalAxis }
          currentVerticalX={ this.props.currentVerticalX }
          currentVerticalY={ this.props.currentVerticalY }
          current_time={ this.state.currentTime }
          contour_var={ this.var_opts[0] }
          contour_var_opts={ this.var_opts }
          boxes_span={ this.state.boxes }
          positivify={ this.positivify }
          linearColorScale={ this.linearColorScale }
          dims={ this.dims }
          res={ this.data_resolution }
        />
      </div>
    );
  }


  // --------------------------------------------------------
  renderCubeControls() {
    return (
      <div id='cube-controls' className={ this.props.currentSliceType }>
        {/* HORIZONTAL CONTROLS */}
        {
          this.props.currentSliceType === 'HORIZONTAL' ?
          <div id='horizontal-ctrl'>
            <div className="axis-label">{ this.props.currentAltitude } m</div>
            <input
              id="scrubber-altitude"
              onChange={ this.props.handleUpdateAltitude }
              type="range"
              min={ this.props.horizontalSliceRange[0] }
              value={ this.props.currentAltitude }
              max={ this.props.horizontalSliceRange[1] }
              step={ this.props.horizontalIncrement * this.data_resolution }
            />
            <span>Z</span>
          </div> : null
        }


        {/* BOX CONTROLLER */}
        <BoxController
          slice_axis={ this.props.currentSliceType }
          altitude={ this.props.currentAltitude }
          current_vertical_axis= { this.props.currentVerticalAxis }
          x_slice_value= { this.props.currentVerticalX }
          y_slice_value= { this.props.currentVerticalY }
          dims = { this.dims }
        />


        {/* VERTICAL CONTROLS */}
        {/* NICE TO HAVE: animated https://codepen.io/hsynlms/pen/QZQeqq */}
        { this.props.currentSliceType === 'VERTICAL' ?
          <div id='vertical-ctrl'>

            <div id='vertical-xy-toggle'>
              <div
                className={`vertical-xy-toggle-opt ${
                  this.props.currentSliceType === 'VERTICAL' && this.props.currentVerticalAxis === 'X' ? ' x-active' : ''
                }`}
                onClick={ () => this.props.handleToggleVerticalAxis('X') }
              >
                <span>X</span>
              </div>
              <div
                className={`vertical-xy-toggle-opt ${
                  this.props.currentSliceType === 'VERTICAL' && this.props.currentVerticalAxis === 'Y' ? ' y-active' : ''
                }`}
                onClick={ () => this.props.handleToggleVerticalAxis('Y') }
              >
                <span>Y</span>
              </div>
            </div>

            <input
              id="scrubber-depth"
              onChange={
                this.props.currentVerticalAxis === 'Y' ?
                this.props.handleUpdateVerticalY : this.props.handleUpdateVerticalX
              }
              type="range"
              min={ this.props.verticalSliceRange[0] }
              value={
                this.props.currentVerticalAxis === 'Y' ?
                this.props.currentVerticalY : this.props.currentVerticalX
              }
              max={ this.props.verticalSliceRange[1] }
              step={ this.props.verticalIncrement * this.data_resolution }
            />

            <div className="axis-label">
              {
                this.props.currentVerticalAxis === 'Y' ?
                this.props.currentVerticalY : this.props.currentVerticalX
              } m
            </div>
          </div> : null
        }
      </div>
    )
  }


  // --------------------------------------------------------
  render() {
    //console.log(this.props);
    return (
      <div id='slices-container'>
        {/* COLUMNS */}
        <div id='slice-columns'>
          <div id="header-cube-controls">

            { this.renderHeader() }
            { this.renderSliceHeaderTabs() }
            { this.renderCubeControls() }

            <div id="subgrid-dims">
              <span>6.0 km x 6.0 km x 4.0 km</span>
            </div>
          </div>

          <div id='slices-container-inner' className='slice-column'>

            {/* Current slice view */}
            { this.state.boxes ? this.renderCurrentSliceView() : null }
            { 
              this.state.boxes ? 
              <TimelineScrubber
                timeStamps = { this.state.timeStamps }
                currentTime={ this.state.currentTime }
                timeRange={ this.state.timeRange }
                timeIncrement={ this.state.timeIncrement }
                handleUpdateTime={ this.handleUpdateTime }
              /> : 
              <div id='slices-loader'>
                <span id='slices-loader-text'>Loading slices, please wait...</span>
              </div>
            }
            
          </div>
        </div>

      </div>
    )
  }
}
