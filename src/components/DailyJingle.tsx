import L from 'leaflet';
import { sum } from 'ramda';
import { useEffect, useRef, useState } from 'react';
import { match } from 'ts-pattern';
import { DEFAULT_PREFERENCES } from '../constants/defaultPreferences';
import { LOCAL_STORAGE } from '../constants/localStorage';
import {
  incrementGlobalGuessCounter,
  incrementSongFailureCount,
  incrementSongSuccessCount,
  postDailyChallengeResult,
} from '../data/jingle-api';
import useGameLogic from '../hooks/useGameLogic';
import {
  DailyChallenge,
  GameSettings,
  GameState,
  GameStatus,
  Page,
  UserPreferences,
} from '../types/jingle';
import {
  incrementLocalGuessCount,
  loadGameStateFromBrowser,
  loadPreferencesFromBrowser,
  savePreferencesToBrowser,
  updateGuessStreak,
} from '../utils/browserUtil';
import { getCurrentDateInBritain } from '../utils/date-utils';
import {
  calculateDailyChallengePercentile,
  copyResultsToClipboard,
  getJingleNumber,
} from '../utils/jingle-utils';
import { playSong } from '../utils/playSong';
import Footer from './Footer';
import GameOver from './GameOver';
import RoundResult from './RoundResult';
import RunescapeMap from './RunescapeMap';
import HomeButton from './buttons/HomeButton';
import NewsModalButton from './buttons/NewsModalButton';
import SettingsModalButton from './buttons/PreferencesModalButton';
import StatsModalButton from './buttons/StatsModalButton';

interface DailyJingleProps {
  dailyChallenge: DailyChallenge;
}
export default function DailyJingle({ dailyChallenge }: DailyJingleProps) {
  const mapRef = useRef<L.Map>(null);
  const jingleNumber = getJingleNumber(dailyChallenge);
  const currentPreferences =
    loadPreferencesFromBrowser() || DEFAULT_PREFERENCES;

  // this is to prevent loading the game state from localstorage multiple times
  const [initialized, setInitialized] = useState(false);
  useEffect(() => setInitialized(true), []);

  const initialGameState: GameState = (() => {
    if (!initialized) {
      const savedGameState = loadGameStateFromBrowser(jingleNumber);
      if (savedGameState) return savedGameState;
    }

    return {
      settings: {
        hardMode: currentPreferences.preferHardMode,
        oldAudio: currentPreferences.preferOldAudio,
      },
      status: GameStatus.Guessing,
      round: 0,
      songs: dailyChallenge.songs,
      scores: [],
      startTime: Date.now(),
      timeTaken: null,
      leaflet_ll_click: null,
    };
  })();
  const jingle = useGameLogic(mapRef, initialGameState);
  const gameState = jingle.gameState;

  const saveGameState = (gameState: GameState) => {
    if (!gameState) {
      throw new Error('trying to save undefined game state');
    }
    localStorage.setItem(
      LOCAL_STORAGE.gameState(jingleNumber),
      JSON.stringify(gameState)
    );
  };

  const audioRef = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    playSong(
      audioRef,
      initialGameState.songs[gameState.round],
      initialGameState.settings.oldAudio,
      initialGameState.settings.hardMode
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmGuess = (latestGameState?: GameState) => {
    const gameState = jingle.confirmGuess(latestGameState);
    saveGameState(gameState);

    // update statistics
    incrementGlobalGuessCounter();
    const currentSong = gameState.songs[gameState.round];
    const correct = gameState.scores[gameState.round] === 1000;
    if (correct) {
      incrementLocalGuessCount(true);
      incrementSongSuccessCount(currentSong);
      updateGuessStreak(true);
    } else {
      incrementLocalGuessCount(false);
      incrementSongFailureCount(currentSong);
      updateGuessStreak(false);
    }

    const isLastRound = gameState.round === gameState.songs.length - 1;
    if (isLastRound) {
      // submit daily challenge
      localStorage.setItem(
        LOCAL_STORAGE.dailyComplete,
        getCurrentDateInBritain()
      );
      postDailyChallengeResult(sum(gameState.scores));
    }
  };

  const endGame = () => {
    const gameState = jingle.endGame();
    saveGameState(gameState);
  };

  const nextSong = () => {
    const gameState = jingle.nextSong();
    saveGameState(gameState);

    const songName = gameState.songs[gameState.round];
    playSong(
      audioRef,
      songName,
      gameState.settings.oldAudio,
      gameState.settings.hardMode
    );
  };

  const updateGameSettings = (preferences: UserPreferences) => {
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

  const scoreLabel = (score: number | undefined) => (
    <div className='osrs-stone-btn score-label'>{score ?? '-'}</div>
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
                updateGameSettings(preferences)
              }
              page={Page.DailyJingle}
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
                    disabled: !gameState.leaflet_ll_click,
                  });
                } else {
                  return (
                    <div className='osrs-frame guess-btn'>
                      Place your pin on the map
                    </div>
                  );
                }
              })
              .with(GameStatus.AnswerRevealed, () => {
                if (gameState.round < gameState.songs.length - 1) {
                  return button({ label: 'Next Song', onClick: nextSong });
                } else {
                  return button({ label: 'End Game', onClick: endGame });
                }
              })
              .with(GameStatus.GameOver, () =>
                button({
                  label: 'Copy Results',
                  onClick: () => {
                    const percentile = calculateDailyChallengePercentile(
                      dailyChallenge,
                      sum(gameState.scores)
                    );
                    copyResultsToClipboard(gameState, percentile);
                  },
                })
              )
              .exhaustive()}

            <div style={{ width: '100%', display: 'flex', gap: '2px' }}>
              {scoreLabel(gameState.scores[0])}
              {scoreLabel(gameState.scores[1])}
              {scoreLabel(gameState.scores[2])}
              {scoreLabel(gameState.scores[3])}
              {scoreLabel(gameState.scores[4])}
            </div>

            <audio controls id='audio' ref={audioRef} />

            <Footer />
          </div>
        </div>
      </div>

      <RunescapeMap
        mapRef={mapRef}
        gameState={gameState}
        onMapClick={(leaflet_ll_click: L.LatLng) => {
          const newGameState = jingle.setClickedPosition(leaflet_ll_click);
          if (!currentPreferences.preferConfirmation) {
            confirmGuess(newGameState); // confirm immediately
          }
        }}
      />

      <RoundResult gameState={gameState} />

      {gameState.status === GameStatus.GameOver && (
        <GameOver gameState={gameState} dailyChallenge={dailyChallenge} />
      )}
    </>
  );
}
