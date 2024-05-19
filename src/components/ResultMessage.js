import React from 'react';
import '../style/resultMessage.css';

export default function ResultMessage({
  resultVisible,
  guessResult,
  currentSongUi,
}) {
  return (
    <div
      className='alert result-message'
      role='alert'
      style={{
        opacity: resultVisible ? 1 : 0,
        transition: 'opacity 500ms, margin-top 500ms ease-in-out',
        marginTop: resultVisible ? '-60px' : '0px',
        color:
          guessResult === 1000
            ? '#00FF00'
            : guessResult === 0
            ? '#FF0000'
            : '#edfd07',
      }}
    >
      +{guessResult}
      <div style={{ fontSize: '70%' }}>{currentSongUi}</div>
    </div>
  );
}
