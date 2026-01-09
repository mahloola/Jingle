import { sum } from 'ramda';
import { RefObject, useEffect, useRef, useState } from 'react';
import { match } from 'ts-pattern';
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
  sanitizePreferences,
  savePreferencesToBrowser,
  updateGuessStreak,
} from '../utils/browserUtil';
import { getCurrentDateInBritain } from '../utils/date-utils';
import { copyResultsToClipboard, getJingleNumber } from '../utils/jingle-utils';
import { playSong } from '../utils/playSong';
import AudioControls from './AudioControls';
import Footer from './Footer';
import GameOver from './GameOver';
import RoundResult from './RoundResult';
import RunescapeMap from './RunescapeMap';
import HistoryModalButton from './side-menu/HistoryModalButton';
import HomeButton from './side-menu/HomeButton';
import NewsModalButton from './side-menu/NewsModalButton';
import SettingsModalButton from './side-menu/PreferencesModalButton';
import StatsModalButton from './side-menu/StatsModalButton';

interface DailyJingleProps {
  dailyChallenge: DailyChallenge;
}

sanitizePreferences();
export default function DailyJingle({ dailyChallenge }: DailyJingleProps) {
  const jingleNumber = getJingleNumber(dailyChallenge);
  const currentPreferences = loadPreferencesFromBrowser();
  const goBackButtonRef = useRef<HTMLDivElement>(null);
  const [finalPercentile, setFinalPercentile] = useState<number | null>(null);

  // this is to prevent loading the game state from localStorage multiple times
  const [initialized, setInitialized] = useState(false);
  useEffect(() => setInitialized(true), []);

  const initialGameState: GameState = (() => {
    return loadGameStateFromBrowser(jingleNumber, dailyChallenge);
  })();
  const jingle = useGameLogic(initialGameState);
  const gameState = jingle.gameState;

  const saveGameState = (gameState: GameState) => {
    if (!gameState) {
      throw new Error('trying to save undefined game state');
    }
    localStorage.setItem(LOCAL_STORAGE.gameState(jingleNumber), JSON.stringify(gameState));
  };

  const audioRef = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    playSong(
      audioRef,
      initialGameState.songs[gameState.round],
      initialGameState.settings.oldAudio,
      ...(currentPreferences.preferHardMode ? [currentPreferences.hardModeLength] : []),
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
      localStorage.setItem(LOCAL_STORAGE.dailyComplete, getCurrentDateInBritain());
      postDailyChallengeResult(sum(gameState.scores), Date.now() - gameState.startTimeMs).then(
        (data) => {
          setFinalPercentile(data?.percentile);
        },
      );
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
      ...(currentPreferences.preferHardMode ? [currentPreferences.hardModeLength] : []),
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

  const button = (props: { label: string; disabled?: boolean; onClick: () => any }) => (
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
              onApplyPreferences={(preferences: UserPreferences) => updateGameSettings(preferences)}
              page={Page.DailyJingle}
            />
            <NewsModalButton />
            <StatsModalButton />
            <HistoryModalButton />
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
                  return <div className='osrs-frame guess-btn'>Place your pin on the map</div>;
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
                    copyResultsToClipboard(gameState, finalPercentile, jingleNumber);
                  },
                }),
              )
              .exhaustive()}

            <div style={{ width: '100%', display: 'flex', gap: '2px' }}>
              {scoreLabel(gameState.scores[0])}
              {scoreLabel(gameState.scores[1])}
              {scoreLabel(gameState.scores[2])}
              {scoreLabel(gameState.scores[3])}
              {scoreLabel(gameState.scores[4])}
            </div>

            <AudioControls
              ref={audioRef}
              gameState={gameState}
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
        GoBackButtonRef={goBackButtonRef as RefObject<HTMLElement>}
      />
      <div
        className='above-map'
        ref={goBackButtonRef}
      ></div>
      <RoundResult gameState={gameState} />
      {gameState.status === GameStatus.GameOver &&
        <GameOver
          gameState={gameState}
          dailyChallenge={dailyChallenge}
          percentile={finalPercentile}
        />
      }
    </>
  );
}
