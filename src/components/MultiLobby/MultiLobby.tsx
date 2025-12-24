import { RefObject, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';
import { match } from 'ts-pattern';
import { useAuth } from '../../AuthContext';
import {
  getLobbies,
  incrementGlobalGuessCounter,
  incrementSongFailureCount,
  incrementSongSuccessCount,
  leaveLobby,
} from '../../data/jingle-api';
import useGameLogic from '../../hooks/useGameLogic';
import {
  GameSettings,
  GameState,
  GameStatus,
  MultiLobby,
  Page,
  Player,
  UserPreferences,
} from '../../types/jingle';
import {
  incrementLocalGuessCount,
  loadPreferencesFromBrowser,
  sanitizePreferences,
  savePreferencesToBrowser,
  updateGuessStreak,
} from '../../utils/browserUtil';
import { SongService } from '../../utils/getRandomSong';
import { playSong } from '../../utils/playSong';
import AudioControls from './../AudioControls';
import Footer from './../Footer';
import RoundResult from './../RoundResult';
import RunescapeMap from './../RunescapeMap';
import HistoryModalButton from './../side-menu/HistoryModalButton';
import HomeButton from './../side-menu/HomeButton';
import NewsModalButton from './../side-menu/NewsModalButton';
import SettingsModalButton from './../side-menu/PreferencesModalButton';
import StatsModalButton from './../side-menu/StatsModalButton';
import { Button } from './../ui-util/Button';
import styles from './MultiLobby.module.css';

sanitizePreferences();

const songService: SongService = SongService.Instance();
// starting song list - put outside component so it doesn't re-construct with rerenders

export default function MultiplayerLobby() {
  const navigate = useNavigate();
  const goBackButtonRef = useRef<HTMLDivElement>(null);
  const currentPreferences = loadPreferencesFromBrowser();
  const { lobbyId } = useParams();
  const { currentUser } = useAuth();
  const { data: lobbies } = useSWR(
    `/api/lobbies`,
    () => {
      return getLobbies();
    },
    {
      dedupingInterval: 0, // 🚨 DISABLE DEDUPING
      revalidateOnMount: true,
      revalidateOnFocus: false,
      focusThrottleInterval: 0,
    },
  );

  const lobby = lobbies.find((lobby: MultiLobby) => lobby.id == lobbyId);

  const initialGameState = {
    settings: {
      hardMode: currentPreferences.preferHardMode,
      oldAudio: currentPreferences.preferOldAudio,
    },
    status: GameStatus.Guessing,
    round: 0,
    songs: [songService.getRandomSong(currentPreferences)],
    scores: [],
    startTimeMs: Date.now(),
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
      ...(currentPreferences.preferHardMode ? [currentPreferences.hardModeLength] : []),
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
      ...(currentPreferences.preferHardMode ? [currentPreferences.hardModeLength] : []),
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

  const handleExitLobby = async () => {
    const token = await currentUser?.getIdToken();
    if (!lobbyId || !token) return;
    try {
      leaveLobby({ lobbyId, token });
      navigate('/multiplayer');
    } catch (err) {
      console.error('Failed to leave lobby: ', err);
    }
  };

  return (
    <>
      <div className='App-inner'>
        <div className='ui-box'>
          <aside className={styles.playersContainer}>
            <div className={`osrs-frame ${styles.lobbyInfo}`}>
              <h2>{lobby.name}</h2>
              {lobby.players?.length > 1 ? `${lobby.players?.length} Players` : null}
            </div>
            {lobby.players.map((player: Player) => {
              return (
                <div
                  key={player?.id}
                  className={`osrs-frame ${styles.playerContainer}`}
                >
                  <h3 className={styles.playerRank}>#1</h3>
                  {player?.avatarUrl ? (
                    <img
                      src={player?.avatarUrl}
                      alt='player-picture'
                      className={styles.playerPicture}
                    />
                  ) : (
                    <img
                      src={
                        'https://i.pinimg.com/474x/18/b9/ff/18b9ffb2a8a791d50213a9d595c4dd52.jpg'
                      }
                      alt='player-picture'
                      className={styles.playerPicture}
                    />
                  )}
                  <span className={styles.playerInfo}>
                    {player?.username}
                    <br />
                    4278 Points
                  </span>
                </div>
              );
            })}
            <Button
              classes={'guess-btn osrs-frame'}
              label='Exit Lobby'
              onClick={handleExitLobby}
            />
          </aside>
          <div className='modal-buttons-container'>
            <HomeButton />
            <SettingsModalButton
              currentPreferences={currentPreferences}
              onApplyPreferences={(preferences: UserPreferences) => updatePreferences(preferences)}
              page={Page.Practice}
            />
            <NewsModalButton />
            <StatsModalButton />
            <HistoryModalButton />
          </div>

          <div className='below-map'>
            {match(gameState.status)
              .with(GameStatus.Guessing, () => {
                if (currentPreferences.preferConfirmation) {
                  return (
                    <Button
                      classes={'guess-btn'}
                      label='Confirm guess'
                      onClick={() => confirmGuess()}
                      disabled={!gameState.clickedPosition}
                    />
                  );
                } else {
                  return <label className='osrs-frame guess-btn'>Place your pin on the map</label>;
                }
              })
              .with(GameStatus.AnswerRevealed, () => (
                <Button
                  classes={'guess-btn'}
                  label='Next Song'
                  onClick={nextSong}
                />
              ))
              .with(GameStatus.GameOver, () => {
                throw new Error('Unreachable');
              })
              .exhaustive()}
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
    </>
  );
}
