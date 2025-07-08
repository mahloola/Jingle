import { useEffect, useRef } from 'react';
import { match } from 'ts-pattern';
import {
  incrementGlobalGuessCounter,
  incrementSongFailureCount,
  incrementSongSuccessCount,
} from '../data/jingle-api';
import useGameLogic from '../hooks/useGameLogic';
import { GameSettings, GameState, GameStatus, Page, UserPreferences } from '../types/jingle';
import {
  incrementLocalGuessCount,
  loadPreferencesFromBrowser,
  savePreferencesToBrowser,
  updateGuessStreak,
} from '../utils/browserUtil';
import { SongService } from '../utils/getRandomSong';
import { playSong } from '../utils/playSong';
import Footer from './Footer';
import RoundResult from './RoundResult';
import RunescapeMap from './RunescapeMap';
import HomeButton from './side-menu/HomeButton';
import NewsModalButton from './side-menu/NewsModalButton';
import SettingsModalButton from './side-menu/PreferencesModalButton';
import StatsModalButton from './side-menu/StatsModalButton';
import { Button } from './ui-util/Button';

const currentPreferences = loadPreferencesFromBrowser();
let songService: SongService = new SongService(currentPreferences);

export default function Practice() {
  const currentPreferences = loadPreferencesFromBrowser();
  useEffect(() => {
    songService = new SongService(currentPreferences);
  }, [currentPreferences]);

  const initialGameState = {
    settings: {
      hardMode: currentPreferences.preferHardMode,
      oldAudio: currentPreferences.preferOldAudio,
    },
    status: GameStatus.Guessing,
    round: 0,
    songs: [songService.getRandomSong(currentPreferences)],
    scores: [],
    startTime: Date.now(),
    timeTaken: null,
    clickedPosition: null,
    navigationStack: [],
  };

  const jingle = useGameLogic(initialGameState);
  const gameState = jingle.gameState;

  const audioRef = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    const songName = gameState.songs[gameState.round];
    playSong(
      audioRef,
      songName,
      currentPreferences.preferOldAudio,
      currentPreferences.preferHardMode,
    );
    songService.removeSong(songName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmGuess = (latestGameState?: GameState) => {
    const gameState = jingle.confirmGuess(latestGameState);

    // update statistics
    incrementGlobalGuessCounter();
    const currentSong = gameState.songs[gameState.round];
    const correct = gameState.scores[gameState.round] === 1000;
    if (correct) {
      incrementSongSuccessCount(currentSong);
      incrementLocalGuessCount(true);
      updateGuessStreak(true);
    } else {
      incrementSongFailureCount(currentSong);
      incrementLocalGuessCount(false);
      updateGuessStreak(false);
    }
  };

  const nextSong = () => {
    const newSong = songService.getRandomSong(currentPreferences);
    const gameState = jingle.addSong(newSong);
    jingle.nextSong(gameState);
    songService.removeSong(newSong);
    playSong(
      audioRef,
      newSong,
      currentPreferences.preferOldAudio,
      currentPreferences.preferHardMode,
    );
  };

  const updatePreferences = (preferences: UserPreferences) => {
    const newSettings: GameSettings = {
      hardMode: preferences.preferHardMode,
      oldAudio: preferences.preferOldAudio,
    };
    jingle.updateGameSettings(newSettings);

    savePreferencesToBrowser(preferences);
  };

  return (
    <>
      <div className='App-inner'>
        <div className='ui-box'>
          <div className='modal-buttons-container'>
            <HomeButton />
            <SettingsModalButton
              currentPreferences={currentPreferences}
              onApplyPreferences={(preferences: UserPreferences) => updatePreferences(preferences)}
              page={Page.Practice}
            />
            <NewsModalButton />
            <StatsModalButton />
          </div>

          <div className='below-map'>
            {match(gameState.status)
              .with(GameStatus.Guessing, () => {
                if (currentPreferences.preferConfirmation) {
                  return (
                    <Button
                      label='Confirm guess'
                      onClick={() => confirmGuess()}
                      disabled={!gameState.clickedPosition}
                    />
                  );
                } else {
                  return <div className='osrs-frame guess-btn'>Place your pin on the map</div>;
                }
              })
              .with(GameStatus.AnswerRevealed, () => (
                <Button
                  label='Next Song'
                  onClick={nextSong}
                />
              ))
              .with(GameStatus.GameOver, () => {
                throw new Error('Unreachable');
              })
              .exhaustive()}

            <audio
              controls
              id='audio'
              ref={audioRef}
              className={gameState.settings.hardMode ? 'hide-scrubber' : ''}
            />

            <Footer />
          </div>
        </div>
      </div>

      <RunescapeMap
        gameState={gameState}
        onMapClick={(clickedPosition) => {
          const newGameState = jingle.setClickedPosition(clickedPosition);
          if (!currentPreferences.preferConfirmation) {
            confirmGuess(newGameState); // confirm immediately
          }
        }}
      />

      <RoundResult gameState={gameState} />
    </>
  );
}
