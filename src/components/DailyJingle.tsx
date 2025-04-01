import { sum } from 'ramda';
import { useEffect, useRef, useState } from 'react';
import { match } from 'ts-pattern';
import { ASSETS } from '../constants/assets';
import {
  incrementGlobalGuessCounter,
  incrementSongFailureCount,
  incrementSongSuccessCount,
  postDailyChallengeResult,
} from '../data/jingle-api';
import { keys } from '../data/localstorage';
import useGameLogic, { Guess } from '../hooks/useGameLogic';
import '../style/uiBox.css';
import {
  DailyChallenge,
  GameState,
  GameStatus,
  ModalType,
} from '../types/jingle';
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
import SettingsModalButton from './buttons/SettingsModalButton';
import StatsModalButton from './buttons/StatsModalButton';
const confirmGuess = true; //remove this and load through settings instead

interface DailyJingleProps {
  dailyChallenge: DailyChallenge;
}
export default function DailyJingle({ dailyChallenge }: DailyJingleProps) {
  const jingleNumber = getJingleNumber(dailyChallenge);
  const loadGameState = (): GameState | null => {
    const gameStateJson = localStorage.getItem(keys.gameState(jingleNumber));
    try {
      const gameState = JSON.parse(gameStateJson ?? 'null');
      return gameState;
    } catch (e) {
      console.error('Failed to parse saved game state: ' + gameState);
      return null;
    }
  };

  const [confirmedGuess, setConfirmedGuess] = useState(false); 
  const [showConfirmGuess, setShowConfirmGuess] = useState(false);

  const [openModalId, setOpenModalId] = useState<ModalType | null>(null);
  const handleModalClick = (id: ModalType) => {
    if (openModalId === id) setOpenModalId(null);
    else setOpenModalId(id);
  };

  const closeModal = () => setOpenModalId(null);
  const saveGameState = (gameState: GameState) => {
    localStorage.setItem(
      keys.gameState(jingleNumber),
      JSON.stringify(gameState),
    );
  };
  const jingle = useGameLogic(dailyChallenge, loadGameState());
  const gameState = jingle.gameState;

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    playSong(audioRef, gameState.songs[gameState.round]);
  }, []);

  const guess = (guess: Guess) => {
    const gameState = jingle.guess(guess);
    saveGameState(gameState);

    

    // update statistics
    incrementGlobalGuessCounter();
    const currentSong = gameState.songs[gameState.round];
    if (guess.correct) incrementSongSuccessCount(currentSong);
    else incrementSongFailureCount(currentSong);

    setConfirmedGuess(false);
    setShowConfirmGuess(false);

    const isLastRound = gameState.round === gameState.songs.length - 1;
    if (isLastRound) {
      // submit daily challenge
      localStorage.setItem(keys.dailyComplete, getCurrentDateInBritain());
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
    playSong(audioRef, songName);
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

         {/* temp button styling coz i can't bear to see the deafult. Work your css magic here*/}
         {confirmGuess && showConfirmGuess && <div style={{
            display:"inline-block",
            position: "fixed",
            top: "15px",
            zIndex: 999,
            backgroundColor: "rgba(88,76,60,1)",
            border: "0.1rem solid rgba(57, 48, 35, 1)",
            borderRadius: "0.2rem"
          }}>
            <button 
            onClick={()=>setConfirmedGuess(true)}
            style={{
              color: "rgb(255, 239, 91)", 
              width:"100%", height:"100%", 
              padding: "0.5rem 1rem 0.1rem 1rem",
             }}>
              <h5>Confirm Guess</h5>
            </button>
        </div>}

        <div className='ui-box'>
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
          <div className='below-map'>
            <div style={{ display: 'flex', gap: '2px' }}>
              <DailyGuessLabel number={gameState.scores[0]} />
              <DailyGuessLabel number={gameState.scores[1]} />
              <DailyGuessLabel number={gameState.scores[2]} />
              <DailyGuessLabel number={gameState.scores[3]} />
              <DailyGuessLabel number={gameState.scores[4]} />
            </div>

            {match(gameState.status)
              .with(GameStatus.Guessing, () =>
                button('Place your pin on the map'),
              )
              .with(GameStatus.AnswerRevealed, () => {
                if (gameState.round < gameState.songs.length - 1) {
                  return button('Next Song', nextSong);
                } else {
                  return button('End Game', endGame);
                }
              })
              .with(GameStatus.GameOver, () =>
                button('Copy Results', () => copyResultsToClipboard(gameState)),
              )
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
        confirmedGuess={confirmedGuess}
        setShowConfirmGuess={setShowConfirmGuess}
      />

      <RoundResult gameState={gameState} />

      {gameState.status === GameStatus.GameOver && (
        <GameOver
          gameState={gameState}
          dailyChallenge={dailyChallenge}
        />
      )}
    </>
  );
}
