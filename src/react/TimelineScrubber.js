// reference: https://codesandbox.io/s/morning-water-z6fjv?fontsize=14&file=/src/index.js

import React from 'react';

// --------------------------------------------------------
// this file handles the timeline scrubber that applies to the slices view
// --------------------------------------------------------
function TimelineScrubber({
  currentRange, timeStamps, currentTime, timeRange, timeIncrement, handleUpdateTime
}) {

  let emptyTimeArr = [];
  for (let i = 0; i < timeRange[0]; i++) {
    emptyTimeArr.push('');
  }

  // --------------------------------------------------------
  const generateIntervals = () => {
    console.log('currentRange:', currentRange)

    return (
      <div className='sliderticks'>
        {[...Array(timeRange[1] + 1)].map((x, i) =>
          <div 
            id={`tick-${i}`} 
            className={`tick ${ i >= currentRange[0] && i <= currentRange[1] ? 'data-loaded' : ''}`} 
            key={`tick-${i}`}
          ><div>{`${i + 1}`}</div></div>
        )}
      </div>
    );
  }

  // --------------------------------------------------------
  const convertToTimestamp = ( index ) => {
    var str = timeStamps[index];
    // console.log(timeStamps);
    var t = str.indexOf("T");
    var st = str.slice(t+1,t+9);

    return st;
  }

  const startTimeStamp = convertToTimestamp(0);
  const currentTimeStamp = convertToTimestamp(currentTime);
  const endTimeStamp = convertToTimestamp(timeStamps.length - 1);

  // --------------------------------------------------------
  return (

    <div id='time-scrubber'>
      <div id='time-scrubber-label-container'>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 0C4.475 0 0 4.475 0 10C0 15.525 4.475 20 10 20C15.525 20 20 15.525 20 10C20 4.475 15.525 0 10 0ZM10.5 18.975V18C10.5 17.725 10.275 17.5 10 17.5C9.725 17.5 9.5 17.725 9.5 18V18.975C4.925 18.725 1.275 15.05 1.025 10.5H2C2.275 10.5 2.5 10.275 2.5 10C2.5 9.725 2.275 9.5 2 9.5H1.025C1.275 4.925 4.95 1.275 9.5 1.025V2C9.5 2.275 9.725 2.5 10 2.5C10.275 2.5 10.5 2.275 10.5 2V1.025C15.075 1.275 18.725 4.95 18.975 9.5H18C17.725 9.5 17.5 9.725 17.5 10C17.5 10.275 17.725 10.5 18 10.5H18.975C18.725 15.075 15.075 18.725 10.5 18.975Z" fill="white"/>
          <path d="M14.8054 5.09815C14.5921 4.93493 14.3077 4.98156 14.1418 5.19142L9.73344 10.8341L6.79453 8.15268C6.60493 7.96615 6.29681 7.98946 6.13091 8.176C5.9413 8.36254 5.965 8.66566 6.15461 8.82888L9.47273 11.8601C9.54384 11.9534 9.66234 12 9.78085 12C9.80455 12 9.80455 12 9.82825 12C9.97045 12 10.089 11.93 10.1601 11.8135L14.9002 5.75103C15.0661 5.54117 15.0187 5.26137 14.8054 5.09815Z" fill="white"/>
        </svg>
        <span className='time-scrubber-label'>
          { currentTimeStamp }
        </span>
      </div>
      <span id='time-range-start' className='time-range-label'>{ startTimeStamp }</span>
      <div id='time-scrubber-inner'>
        <input
          id="time-scrubber-ctrl"
          onChange={ handleUpdateTime }
          type="range"
          min={ timeRange[0] }
          value={ currentTime }
          max={ timeRange[1] }
          step={ timeIncrement }
        />
        { generateIntervals() }
      </div>
      <span id='time-range-end' className='time-range-label'>{ endTimeStamp }</span>
    </div>

  );

}

export default TimelineScrubber;
