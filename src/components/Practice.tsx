import { useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import { match } from 'ts-pattern';
import { ASSETS } from '../constants/assets';
import { DEFAULT_PREFERENCES } from '../constants/defaultPreferences';
import { Region } from '../constants/regions';
import {
  getSongList,
  incrementGlobalGuessCounter,
  incrementSongFailureCount,
  incrementSongSuccessCount,
} from '../data/jingle-api';
import { Guess } from '../hooks/useGameLogic';
import '../style/audio.css';
import '../style/uiBox.css';
import {
  GameState,
  GameStatus,
  ModalType,
  Screen,
  Song,
  UserPreferences,
} from '../types/jingle';
import {
  incrementLocalGuessCount,
  loadPreferencesFromBrowser,
  loadSeenAnnouncementIdFromBrowser,
  savePreferencesToBrowser,
  setSeenAnnouncementIdToBrowser,
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
    guess: null,
  };
  const [gameState, setGameState] = useState<GameState>(initialGameState);

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

  const setGuess = (guess: Guess): GameState => {
    const newGameState = { ...gameState, guess };
    setGameState(newGameState);
    return newGameState;
  };

  const confirmGuess = (latestGameState?: GameState) => {
    const newGameState = latestGameState ?? gameState;
    const score = Math.round(
      newGameState.guess!.correct
        ? 1000
        : (1000 * 1) / Math.exp(0.0018 * newGameState.guess!.distance),
    );

    // update statistics
    incrementGlobalGuessCounter();
    const currentSong = newGameState.songs[newGameState.round];
    if (newGameState.guess!.correct) {
      incrementSongSuccessCount(currentSong);
      incrementLocalGuessCount(true);
      updateGuessStreak(true);
    } else {
      incrementSongFailureCount(currentSong);
      incrementLocalGuessCount(false);
      updateGuessStreak(false);
    }

    setGameState((prev) => ({
      ...prev,
      status: GameStatus.AnswerRevealed,
      scores: [...prev.scores, score],
    }));
  };

  const nextSong = () => {
    const newSong = getRandomSong(enabledRegions);
    setGameState((prev) => ({
      ...prev,
      round: prev.round + 1,
      status: GameStatus.Guessing,
      songs: [...prev.songs, newSong],
      guess: null,
    }));

    playSong(
      audioRef,
      newSong,
      currentPreferences.preferOldAudio,
      currentPreferences.preferHardMode,
    );
  };

  const updatePreferences = (preferences: UserPreferences) => {
    const { preferHardMode, preferOldAudio } = preferences;

    setGameState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        hardMode: preferHardMode,
        oldAudio: preferOldAudio,
      },
    }));
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
                updatePreferences(preferences)
              }
              screen={Screen.Practice}
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
                    disabled: !gameState.guess,
                  });
                } else {
                  return button({ label: 'Place your pin on the map' });
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
        onMapClick={(guess: Guess) => {
          const newGameState = setGuess(guess);
          if (!currentPreferences.preferConfirmation) {
            confirmGuess(newGameState); // confirm immediately
          }
        }}
      />

      <RoundResult gameState={gameState} />
    </>
  );
}
