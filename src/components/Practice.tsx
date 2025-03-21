import { useEffect, useRef, useState } from 'react';
import { match } from 'ts-pattern';
import { ASSETS } from '../constants/assets';
import {
  incrementGlobalGuessCounter,
  incrementSongFailureCount,
  incrementSongSuccessCount,
} from '../data/jingle-api';
import { Guess } from '../hooks/useGameLogic';
import '../style/uiBox.css';
import { GameState, GameStatus, ModalType } from '../types/jingle';
import { getRandomSong } from '../utils/getRandomSong';
import { playSong } from '../utils/playSong';
import Footer from './Footer';
import RoundResult from './RoundResult';
import RunescapeMap from './RunescapeMap';
import HomeButton from './buttons/HomeButton';
import NewsModalButton from './buttons/NewsModalButton';
import SettingsModalButton from './buttons/SettingsModalButton';
import StatsModalButton from './buttons/StatsModalButton';

export default function Practice() {
  const [gameState, setGameState] = useState<GameState>({
    status: GameStatus.Guessing,
    round: 0,
    songs: [getRandomSong()],
    scores: [],
    startTime: Date.now(),
    timeTaken: null,
    guessedPosition: null,
    correctPolygon: null,
  });

  const [openModalId, setOpenModalId] = useState<ModalType | null>(null);
  const handleModalClick = (id: ModalType) => {
    if (openModalId === id) setOpenModalId(null);
    else setOpenModalId(id);
  };
  const closeModal = () => setOpenModalId(null);
  console.log('Practice.tsx: openModalId', openModalId);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    playSong(audioRef, gameState.songs[gameState.round]);
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
    const newSong = getRandomSong();
    setGameState((prev) => ({
      ...prev,
      round: prev.round + 1,
      status: GameStatus.Guessing,
      songs: [...prev.songs, newSong],
    }));

    playSong(audioRef, newSong);
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
              currentSettings={undefined}
              onApplySettings={() => {}}
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
