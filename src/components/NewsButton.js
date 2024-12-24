import React from 'react';
import '../style/newsButton.css';

function NewsButton() {
  return (
    <div
      className='news-btn-container'
      onClick={() => {
        window.location.reload();
      }}
    ></div>
  );
}

export default NewsButton;
