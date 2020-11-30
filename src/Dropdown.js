import React, { useState } from 'react';


// --------------------------------------------------------
// this file handles all the dropdown menus
// --------------------------------------------------------
function Dropdown({ default_var, items, onChange }) {
  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState(default_var);

  // --------------------------------------------------------
  const toggle = () => setOpen(!open);

  // --------------------------------------------------------
  function handleOnClick(item) {
    setSelection(item);
    toggle(!open);
    onChange(item);
  }

  // --------------------------------------------------------
  return (
    <div className='dropdown-container'>
      {/* HEADER */}
      <div
        tabIndex={0}
        className='dropdown-header'
        role='button'
        onKeyPress={ () => toggle(!open) }
        onClick={ () => toggle(!open) }
      >
        <span>{`${selection}`}</span>
      </div>
      {/* ITEMS */}
      {
        open && (
          <ul className='dropdown-list'>
            { items.map( (item, idx) => (
                <li className='dropdown-item' key={`${item}-${idx}`}>
                  <button
                    className='dropdown-item-btn'
                    type='button'
                    onClick={ () => handleOnClick(item) }>
                      <span>{ item }</span>
                  </button>
                </li>
            ))}
          </ul>
        )
      }

    </div>
  );
}

export default Dropdown;
