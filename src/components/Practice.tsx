import { useEffect, useRef } from 'react';
import { match } from 'ts-pattern';
import { DEFAULT_PREFERENCES } from '../constants/defaultPreferences';
import { Region } from '../constants/regions';
import {
  incrementGlobalGuessCounter,
  incrementSongFailureCount,
  incrementSongSuccessCount,
} from '../data/jingle-api';
import {
  GameSettings,
  GameState,
  GameStatus,
  Page,
  UserPreferences,
} from '../types/jingle';
import {
  incrementLocalGuessCount,
  loadPreferencesFromBrowser,
  savePreferencesToBrowser,
  updateGuessStreak,
} from '../utils/browserUtil';
import { getRandomSong } from '../utils/getRandomSong';
import { playSong } from '../utils/playSong';
import Footer from './Footer';
import RoundResult from './RoundResult';
import RunescapeMap from './RunescapeMap';
import HomeButton from './buttons/HomeButton';
import NewsModalButton from './buttons/NewsModalButton';
import SettingsModalButton from './buttons/PreferencesModalButton';
import StatsModalButton from './buttons/StatsModalButton';
import useGameLogic from '../hooks/useGameLogic';

export default function Practice() {
  const currentPreferences =
    loadPreferencesFromBrowser() || DEFAULT_PREFERENCES;
  const enabledRegions = (
    Object.keys(currentPreferences.regions) as Region[]
  ).filter((region) => currentPreferences.regions[region]);

  const initialGameState = {
    settings: {
      hardMode: currentPreferences.preferHardMode,
      oldAudio: currentPreferences.preferOldAudio,
    },
    status: GameStatus.Guessing,
    round: 0,
    songs: [getRandomSong(enabledRegions)],
    scores: [],
    startTime: Date.now(),
    timeTaken: null,
    clickedPosition: null,
  };
  const jingle = useGameLogic(initialGameState);
  const gameState = jingle.gameState;

  const audioRef = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    playSong(
      audioRef,
      initialGameState.songs[initialGameState.round],
      currentPreferences.preferOldAudio,
      currentPreferences.preferHardMode,
    );
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
    const newSong = getRandomSong(enabledRegions);
    const gameState = jingle.addSong(newSong);
    jingle.nextSong(gameState);
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

  const button = (props: {
    label: string;
    disabled?: boolean;
    onClick: () => any;
  }) => (
    <button
      className='osrs-btn guess-btn'
      onClick={props.onClick}
      disabled={props.disabled}
      style={{ pointerEvents: !props.onClick ? 'none' : 'auto' }}
    >
      {props.label}
    </button>
  );

  return (
    <>
      <div className='App-inner'>
        <div className='ui-box'>
          <div className='modal-buttons-container'>
            <HomeButton />
            <SettingsModalButton
              currentPreferences={currentPreferences}
              onApplyPreferences={(preferences: UserPreferences) =>
                updatePreferences(preferences)
              }
              page={Page.Practice}
            />
            <NewsModalButton />
            <StatsModalButton />
          </div>

          <div className='below-map'>
            {match(gameState.status)
              .with(GameStatus.Guessing, () => {
                if (currentPreferences.preferConfirmation) {
                  return button({
                    label: 'Confirm guess',
                    onClick: () => confirmGuess(),
                    disabled: !gameState.clickedPosition,
                  });
                } else {
                  return (
                    <div className='osrs-frame guess-btn'>
                      Place your pin on the map
                    </div>
                  );
                }
              })
              .with(GameStatus.AnswerRevealed, () =>
                button({ label: 'Next Song', onClick: nextSong }),
              )
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
