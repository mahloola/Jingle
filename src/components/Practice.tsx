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
  loadPreferencesFromBrowser,
  savePreferencesToBrowser,
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

  const [gameState, setGameState] = useState<GameState>({
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
    guessedPosition: null,
    correctPolygon: null,
  });

  const { data, error } = useSWR<Song[]>('/api/songs', getSongList, {
    refreshInterval: 300000,
  });

  const sortedSongList = useMemo(() => {
    if (!data) return [];

    return [...data].sort((a, b) => {
      const aSuccess = a.successCount / (a.successCount + a.failureCount);
      const bSuccess = b.successCount / (b.successCount + b.failureCount);
      return bSuccess - aSuccess;
    });
  }, [data]);

  const [openModalId, setOpenModalId] = useState<ModalType | null>(null);

  const handleModalClick = (id: ModalType) => {
    if (openModalId === id) setOpenModalId(null);
    else setOpenModalId(id);
  };
  const closeModal = () => setOpenModalId(null);

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    playSong(
      audioRef,
      gameState.songs[gameState.round],
      currentPreferences.preferOldAudio,
      currentPreferences.preferHardMode,
    );
  }, []);

  const guess = (guess: Guess) => {
    const score = Math.round(
      guess.correct ? 1000 : (1000 * 1) / Math.exp(0.0018 * guess.distance),
    );

    // update statistics
    incrementGlobalGuessCounter();
    const currentSong = gameState.songs[gameState.round];
    if (guess.correct) incrementSongSuccessCount(currentSong);
    else incrementSongFailureCount(currentSong);

    setGameState((prev) => ({
      ...prev,
      status: GameStatus.AnswerRevealed,
      scores: [...prev.scores, score],
      guessedPosition: guess.guessedPosition,
      correctPolygon: guess.correctPolygon,
    }));
  };

  const nextSong = () => {
    const newSong = getRandomSong(enabledRegions);
    setGameState((prev) => ({
      ...prev,
      round: prev.round + 1,
      status: GameStatus.Guessing,
      songs: [...prev.songs, newSong],
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

  const button = (label: string, onClick?: () => any) => (
    <div
      className='guess-btn-container'
      onClick={onClick}
      style={{ pointerEvents: onClick ? 'auto' : 'none' }}
    >
      <img
        src={ASSETS['labelWide']}
        alt='OSRS Button'
      />
      <div className='guess-btn'>{label}</div>
    </div>
  );

  return (
    <>
      <div className='App-inner'>
        <div className='ui-box'>
          <div className='modal-buttons-container'>
            <HomeButton />
            <SettingsModalButton
              open={openModalId === ModalType.Settings}
              onClose={closeModal}
              onClick={() => handleModalClick(ModalType.Settings)}
              currentPreferences={currentPreferences}
              onApplyPreferences={(preferences: UserPreferences) =>
                updatePreferences(preferences)
              }
              screen={Screen.Practice as Screen}
            />
            <NewsModalButton
              open={openModalId === ModalType.News}
              onClose={closeModal}
              onClick={() => handleModalClick(ModalType.News)}
            />
            <StatsModalButton
              open={openModalId === ModalType.Stats}
              onClose={closeModal}
              onClick={() => handleModalClick(ModalType.Stats)}
              stats={sortedSongList}
            />
          </div>

          <div className='below-map'>
            {match(gameState.status)
              .with(GameStatus.Guessing, () =>
                button('Place your pin on the map'),
              )
              .with(GameStatus.AnswerRevealed, () =>
                button('Next Song', nextSong),
              )
              .with(GameStatus.GameOver, () => {
                throw new Error('Unreachable');
              })
              .exhaustive()}

            <audio
              controls
              id='audio'
              ref={audioRef}
            />

            <Footer />
          </div>
        </div>
      </div>

      <RunescapeMap
        gameState={gameState}
        onGuess={guess}
      />

      <RoundResult gameState={gameState} />
    </>
  );
}
