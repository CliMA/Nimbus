import React from 'react';

// --------------------------------------------------------
// this file handles all the toggles
// --------------------------------------------------------
function Switch({ isOn, handleToggle, toggleName }) {
  return (
    <>
      <input
        checked={ isOn }
        onChange={ handleToggle }
        className="react-switch-checkbox"
        id={`react-switch-new-${ toggleName }`}
        type="checkbox"
      />
      <label
        style={{ background: isOn && '#b6c8ff' }}
        className="react-switch-label"
        htmlFor={`react-switch-new-${ toggleName }`}
      >
        <span className={`react-switch-button`} />
      </label>
    </>
  );
};

export default Switch;
