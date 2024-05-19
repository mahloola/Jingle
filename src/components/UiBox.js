import React from 'react';
import { mediaHostUrl } from '../data/hostUrl';
import '../style/uiBox.css';
import { copyResultsToClipboard } from '../utils/copyResultsToClipboard';
import { getRandomSong } from '../utils/getSong';
import DailyGuessLabel from './DailyGuessLabel';

export default function UiBox({
  dailyMode,
  resultsArray,
  dailyComplete,
  dailyChallenge,
  setCurrentSong,
  guessResult,
  setResultVisible,
  setCorrectPolygon,
  dailyChallengeIndex,
  playSong,
  audioRef,
  sourceRef,
  setDailyChallengeIndex,
  practiceRoundsMode,
}) {
  return (
    <div className='below-map'>
      {dailyMode ||
        (practiceRoundsMode && (
          <table
            style={{
              marginBottom: '10px',
              width: '100%',
              pointerEvents: 'none',
            }}
          >
            <tbody>
              <tr>
                <td>
                  <DailyGuessLabel number={resultsArray[0] || '-'} />
                </td>
                <td>
                  <DailyGuessLabel number={resultsArray[1] || '-'} />
                </td>
                <td>
                  <DailyGuessLabel number={resultsArray[2] || '-'} />
                </td>
                <td>
                  <DailyGuessLabel number={resultsArray[3] || '-'} />
                </td>
                <td>
                  <DailyGuessLabel number={resultsArray[4] || '-'} />
                </td>
              </tr>
            </tbody>
          </table>
        ))}

      {/* guess button */}
      <div
        className='guess-btn-container'
        onClick={() => {
          if (dailyMode) {
            if (dailyComplete) {
              copyResultsToClipboard(resultsArray);
              return;
            } else {
              const newSongName = dailyChallenge.songs[dailyChallengeIndex + 1];
              setCurrentSong(newSongName);
              playSong(newSongName);
              setDailyChallengeIndex(dailyChallengeIndex + 1);
              setCorrectPolygon(null);
              setResultVisible(false);
            }
          } else {
            const newSongName = getRandomSong();
            setCurrentSong(newSongName);
            playSong(newSongName);
            setCorrectPolygon(null);
            setResultVisible(false);
          }
        }}
      >
        <img
          src={`${mediaHostUrl}/osrsButtonWide.png`}
          alt='OSRS Button'
        />
        <div className='guess-btn'>
          {dailyComplete == true
            ? 'Copy Results to Clipboard'
            : guessResult == -1
            ? 'Place your pin on the map'
            : 'Next Song'}
        </div>
      </div>
      <audio
        controls
        id='audio'
        ref={audioRef}
      >
        <source
          id='source'
          ref={sourceRef}
          type='audio/mpeg'
        ></source>
      </audio>
    </div>
  );
}
