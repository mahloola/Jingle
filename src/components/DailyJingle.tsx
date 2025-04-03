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
  Song,
} from '../types/jingle';
import {
  incrementLocalGuessCount,
  loadGameStateFromBrowser,
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
const confirmGuess = true; //remove this and load through settings instead

interface DailyJingleProps {
  dailyChallenge: DailyChallenge;
}
export default function DailyJingle({ dailyChallenge }: DailyJingleProps) {
  const jingleNumber = getJingleNumber(dailyChallenge);
  const existingGameState = loadGameStateFromBrowser(jingleNumber) || {
    settings: {
      hardMode: DEFAULT_PREFERENCES.preferHardMode,
      oldAudio: DEFAULT_PREFERENCES.preferOldAudio,
    },
    status: GameStatus.Guessing,
    round: 0,
    songs: dailyChallenge.songs,
    scores: [],
    startTime: Date.now(),
    timeTaken: null,
    guessedPosition: null,
    correctPolygon: null,
  };

<<<<<<< HEAD
  const [confirmedGuess, setConfirmedGuess] = useState(false); 
  const [showConfirmGuess, setShowConfirmGuess] = useState(false);
=======
  const { data, error } = useSWR<Song[]>('/api/songs', getSongList, {});

  const sortedSongList = useMemo(() => {
    if (!data) return [];

    return [...data].sort((a, b) => {
      const aSuccess = a.successCount / (a.successCount + a.failureCount);
      const bSuccess = b.successCount / (b.successCount + b.failureCount);
      return bSuccess - aSuccess;
    });
  }, [data]);
>>>>>>> 12ac6a09841c053aa0c5784404bb46c11b4628f6

  const [openModalId, setOpenModalId] = useState<ModalType | null>(null);
  const handleModalClick = (id: ModalType) => {
    if (openModalId === id) setOpenModalId(null);
    else setOpenModalId(id);
  };

  const closeModal = () => setOpenModalId(null);
  const saveGameState = (gameState: GameState) => {
    localStorage.setItem(
      LOCAL_STORAGE.gameState(jingleNumber),
      JSON.stringify(gameState),
    );
  };

  const jingle = useGameLogic(dailyChallenge, existingGameState);
  const gameState = jingle.gameState;

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    playSong(
      audioRef,
      gameState.songs[gameState.round],
      gameState.settings.oldAudio,
      gameState.settings.hardMode,
    );
  }, []);

  const guess = (guess: Guess) => {
    const gameState = jingle.guess(guess);
    saveGameState(gameState);

    

    // update statistics
    incrementGlobalGuessCounter();
    const currentSong = gameState.songs[gameState.round];
    if (guess.correct) {
      incrementLocalGuessCount(true);
      incrementSongSuccessCount(currentSong);
    } else {
      incrementLocalGuessCount(false);
      incrementSongFailureCount(currentSong);
    }

    setConfirmedGuess(false);
    setShowConfirmGuess(false);

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

  const updateGameSettings = (settings: GameSettings) => {
    const { hardMode, oldAudio } = settings;
    const gameState = jingle.updateGameSettings(settings);
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
          <div className='modal-buttons-container'>
            <HomeButton />
            <SettingsModalButton
              open={openModalId === ModalType.Settings}
              onClose={closeModal}
              onClick={() => handleModalClick(ModalType.Settings)}
              currentPreferences={jingle.gameState.settings}
              onApplyPreferences={(settings: GameSettings) =>
                updateGameSettings(settings)
              }
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
