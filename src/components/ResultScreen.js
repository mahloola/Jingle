import React from 'react';
import '../style/resultScreen.css';
import { copyResultsToClipboard } from '../utils/copyResultsToClipboard';
import { isMobile } from '../utils/isMobile';
import Countdown from './Countdown';

function ResultScreen({ resultsArray, percentile, time }) {
  const totalResult = resultsArray.reduce((a, b) => a + b, 0);
  return (
    <>
      <div className='result-screen-parent'>
        <div className='result-screen result-screen-results'>
          <div className='result-screen-title'>Jingle #2</div>
          <div className='result-screen-data-row'>
            <div>Score</div>
            <div>{totalResult}</div>
          </div>
          <div className='result-screen-data-row'>
            <div>Time</div>
            <div>{time}</div>
          </div>
          <div className='result-screen-data-row'>
            <div>Percentile</div>
            <div>{percentile ? percentile.toFixed(1) + '%' : 'N/A'}</div>
          </div>
          <Countdown />
          <hr />
          <div className='result-screen-link-container'>
            {!isMobile && (
              <div
                className='result-screen-option'
                onClick={() =>
                  copyResultsToClipboard(
                    resultsArray,
                    time,
                    percentile.toFixed(1),
                  )
                }
              >
                Copy Results
              </div>
            )}

            <a
              href='/'
              className='result-screen-option'
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

export default ResultScreen;
