import React from 'react';
import '../style/statsButton.css';

function StatsButton() {
  return (
    <div
      className='stats-btn-container'
      onClick={() => {
        window.location.reload();
      }}
    ></div>
  );
}

export default StatsButton;
