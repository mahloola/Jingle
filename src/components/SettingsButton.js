import React from 'react';
import '../style/settingsButton.css';

function SettingsButton() {
  return (
    <div
      className='settings-btn-container'
      onClick={() => {
        window.location.reload();
      }}
    ></div>
  );
}

export default SettingsButton;
