import { sum } from 'ramda';
import { useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import { match } from 'ts-pattern';
import { ASSETS } from '../constants/assets';
import { DEFAULT_PREFERENCES } from '../constants/defaultPreferences';
import { LOCAL_STORAGE } from '../constants/localStorage';
import {
  getSongList,
  incrementGlobalGuessCounter,
  incrementSongFailureCount,
  incrementSongSuccessCount,
  postDailyChallengeResult,
} from '../data/jingle-api';
import useGameLogic, { Guess } from '../hooks/useGameLogic';
import '../style/uiBox.css';
import {
  DailyChallenge,
  GameSettings,
  GameState,
  GameStatus,
  ModalType,
  Screen,
  Song,
  UserPreferences,
} from '../types/jingle';
import {
  incrementLocalGuessCount,
  loadGameStateFromBrowser,
  loadPreferencesFromBrowser,
  loadSeenAnnouncementIdFromBrowser,
  savePreferencesToBrowser,
  setSeenAnnouncementIdToBrowser,
} from '../utils/browserUtil';
import { getCurrentDateInBritain } from '../utils/date-utils';
import { copyResultsToClipboard, getJingleNumber } from '../utils/jingle-utils';
import { playSong } from '../utils/playSong';
import DailyGuessLabel from './DailyGuessLabel';
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
  const jingleNumber = getJingleNumber(dailyChallenge);
  const currentPreferences =
    loadPreferencesFromBrowser() || DEFAULT_PREFERENCES;

  const initialGameState: GameState = loadGameStateFromBrowser(
    jingleNumber,
  ) || {
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
    guess: null,
  };
  const jingle = useGameLogic(dailyChallenge, initialGameState);

  const saveGameState = (gameState: GameState) => {
    if (!gameState) {
      throw new Error('trying to save undefined game state');
    }
    localStorage.setItem(
      LOCAL_STORAGE.gameState(jingleNumber),
      JSON.stringify(gameState),
    );
  };

  const gameState = jingle.gameState;
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    playSong(
      audioRef,
      initialGameState.songs[gameState.round],
      initialGameState.settings.oldAudio,
      initialGameState.settings.hardMode,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmGuess = (latestGameState?: GameState) => {
    const gameState = jingle.confirmGuess(latestGameState);
    saveGameState(gameState);

    // update statistics
    incrementGlobalGuessCounter();
    const currentSong = gameState.songs[gameState.round];
    if (gameState.guess!.correct) {
      incrementLocalGuessCount(true);
      incrementSongSuccessCount(currentSong);
    } else {
      incrementLocalGuessCount(false);
      incrementSongFailureCount(currentSong);
    }

    const isLastRound = gameState.round === gameState.songs.length - 1;
    if (isLastRound) {
      // submit daily challenge
      localStorage.setItem(
        LOCAL_STORAGE.dailyComplete,
        getCurrentDateInBritain(),
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
      gameState.settings.hardMode,
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
    onClick?: () => any;
  }) => (
    <button
      className='guess-btn-container'
      onClick={props.onClick}
      style={{
        pointerEvents: !props.onClick || props.disabled ? 'none' : 'auto',
        opacity: props.disabled ? 0.5 : 1,
      }}
    >
      <img src={ASSETS['labelWide']} alt='OSRS Button' />
      <div className='guess-btn'>{props.label}</div>
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
                updateGameSettings(preferences)
              }
              screen={Screen.DailyJingle}
            />
            <NewsModalButton />
            <StatsModalButton />
          </div>
          <div className='below-map'>
            <div style={{ display: 'flex', gap: '2px' }}>
              <DailyGuessLabel number={gameState.scores[0]} />
              <DailyGuessLabel number={gameState.scores[1]} />
              <DailyGuessLabel number={gameState.scores[2]} />
              <DailyGuessLabel number={gameState.scores[3]} />
              <DailyGuessLabel number={gameState.scores[4]} />
            </div>

            {match(gameState.status)
              .with(GameStatus.Guessing, () => {
                if (currentPreferences.preferConfirmation) {
                  return button({
                    label: 'Confirm guess',
                    onClick: () => confirmGuess(),
                    disabled: !gameState.guess,
                  });
                } else {
                  return button({ label: 'Place your pin on the map' });
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
                  onClick: () => copyResultsToClipboard(gameState),
                }),
              )
              .exhaustive()}

            <audio controls id='audio' ref={audioRef} />

            <Footer />
          </div>
        </div>
      </div>

      <RunescapeMap
        gameState={gameState}
        onMapClick={(guess: Guess) => {
          const newGameState = jingle.setGuess(guess);
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
