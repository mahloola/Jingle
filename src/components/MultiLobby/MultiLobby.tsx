import { RefObject, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { match } from 'ts-pattern';
import { useAuth } from '../../AuthContext';
import { confirmGuess, leaveLobby, placePin, startLobby } from '../../data/jingle-api';
import { useLobbyWebSocket } from '../../hooks/useLobbyWebSocket';
import { ClickedPosition, MultiLobbyStatus, NavigationState, Player } from '../../types/jingle';
import { assertLobbyAndUser } from '../../utils/assert';
import { loadPreferencesFromBrowser, sanitizePreferences } from '../../utils/browserUtil';
import { SongService } from '../../utils/getRandomSong';
import { findNearestPolygonWhereSongPlays } from '../../utils/map-utils';
import { playSong } from '../../utils/playSong';
import { calcGradientColor } from '../../utils/string-utils';
import AudioControlsMulti from '../AudioControlsMulti';
import Footer from '../Footer';
import RunescapeMapMultiWrapper from '../RunescapeMapMulti';
import HistoryModalButton from '../side-menu/HistoryModalButton';
import HomeButton from '../side-menu/HomeButton';
import NewsModalButton from '../side-menu/NewsModalButton';
import StatsModalButton from '../side-menu/StatsModalButton';
import { Button } from '../ui-util/Button';
import styles from './MultiLobby.module.css';
sanitizePreferences();
const songService: SongService = SongService.Instance();

// starting song list - put outside component so it doesn't re-construct with rerenders

export default function MultiplayerLobby() {
  const { lobbyId } = useParams<{ lobbyId: string }>();
  console.log(`Lobby ID: ${lobbyId}`);
  const { lobby, timeLeft, socket } = useLobbyWebSocket(lobbyId);
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.uid;

  const [score, setScore] = useState(0);

  // this will be updated every 1 SECOND via polling
  const lobbyState = lobby?.gameState;

  // this is for playing the song
  const prevStatusRef = useRef(lobbyState?.status);

  // for local UI stuff
  const goBackButtonRef = useRef<HTMLDivElement>(null);
  const [guessConfirmed, setGuessConfirmed] = useState(false);
  const [navigationState, setNavigationState] = useState<NavigationState>({
    clickedPosition: null,
    navigationStack: [],
  });

  if (!lobby || !lobbyState || !currentUser) throw Error("Couldn't load lobby or lobby state.");

  const navigate = useNavigate();
  // just for hard mode
  const currentPreferences = loadPreferencesFromBrowser();

  const audioRef = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    const wasPlaying = prevStatusRef.current === MultiLobbyStatus.Playing;
    const isPlaying = lobbyState.status === MultiLobbyStatus.Playing;

    // Only run if status CHANGED to Playing
    if (!wasPlaying && isPlaying) {
      const songName = lobbyState.currentRound?.songName;
      playSong(
        audioRef,
        songName,
        currentPreferences.preferOldAudio,
        lobby.settings.hardMode ? lobby.settings.hardModeLength : undefined,
      );
    }
    setGuessConfirmed(false);
    // Update the ref for next time
    prevStatusRef.current = lobbyState.status;
  }, [lobbyState.status /* other dependencies */]);

  const handlePlacePin = async (clickedPosition: ClickedPosition) => {
    if (guessConfirmed) return;
    if (lobby.gameState.status !== MultiLobbyStatus.Playing) {
      return;
    }
    setNavigationState((prev) => ({
      ...prev,
      clickedPosition: clickedPosition,
    }));

    const { lobbyId: id, token } = await assertLobbyAndUser({ lobbyId: lobbyId, currentUser });

    const { distance } = findNearestPolygonWhereSongPlays(
      lobbyState.currentRound.songName,
      clickedPosition,
    );

    placePin({ lobbyId: id, token, clickedPosition, distance });
  };

  const handleConfirmGuess = async () => {
    const { lobbyId: id, token } = await assertLobbyAndUser({ lobbyId, currentUser });
    await confirmGuess({ lobbyId: id, token });
    setGuessConfirmed(true);
  };

  const handleExitLobby = async () => {
    const { lobbyId: id, token } = await assertLobbyAndUser({ lobbyId: lobbyId, currentUser });
    try {
      leaveLobby({ lobbyId: id, token });
      navigate('/multiplayer');
    } catch (err) {
      console.error('Failed to leave lobby: ', err);
    }
  };

  const handleStartGame = async () => {
    const { lobbyId: id, token } = await assertLobbyAndUser({ lobbyId: lobbyId, currentUser });
    try {
      await startLobby({ lobbyId: id, token });
    } catch (err) {
      console.error('Failed to start lobby: ', err);
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
              <div className={styles.status}>{lobby.gameState.status}</div>
              {lobby.gameState?.currentPhaseEndTime && <h2>{timeLeft}</h2>}
            </div>
            {lobby.players.map((player: Player) => {
              const playerScore = lobby.gameState.currentRound.results.find(
                (result) => result.userId === player.id,
              )?.score;
              return (
                <div
                  key={player?.id}
                  className={`osrs-frame ${styles.playerContainer}`}
                >
                  {lobbyState.status === MultiLobbyStatus.Revealing ? (
                    <div className={styles.playerContainerSimple}>
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
                      <h1
                        className={styles.playerScore}
                        style={{
                          color: calcGradientColor({ val: playerScore ?? 0, min: -300, max: 1000 }),
                        }}
                      >
                        {playerScore ? `+${playerScore}` : '-'}
                      </h1>
                    </div>
                  ) : (
                    <div className={styles.playerContainerDetails}>
                      {/* <h3 className={styles.playerRank}>#1</h3> */}
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
                        {lobby.gameState.status === MultiLobbyStatus.Revealing && playerScore
                          ? playerScore
                          : '---'}{' '}
                        Points
                      </span>
                    </div>
                  )}
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
            <NewsModalButton />
            <StatsModalButton />
            <HistoryModalButton />
          </div>

          <div className='below-map'>
            {match(lobbyState.status)
              .with(MultiLobbyStatus.Playing, () => (
                <Button
                  classes={'guess-btn'}
                  label={guessConfirmed ? 'Confirmed' : 'Confirm Guess'}
                  onClick={handleConfirmGuess}
                  disabled={guessConfirmed}
                />
              ))
              .with(MultiLobbyStatus.Revealing, () => (
                <Button
                  classes={'guess-btn'}
                  label='Revealing'
                  disabled
                />
              ))
              .with(MultiLobbyStatus.Waiting, () =>
                currentUserId === lobby.ownerId ? (
                  <Button
                    classes={'guess-btn'}
                    label='Start game'
                    onClick={handleStartGame}
                  />
                ) : (
                  <Button
                    classes={'guess-btn'}
                    label='Waiting for game to start'
                    disabled
                  />
                ),
              )
              .with(MultiLobbyStatus.Stopped, () => (
                <Button
                  classes={'guess-btn'}
                  label='Game Over'
                />
              ))
              .exhaustive()}
            <AudioControlsMulti
              ref={audioRef}
              gameState={lobbyState}
              multiGame={lobby}
            />
            <Footer />
          </div>
        </div>
      </div>

      <RunescapeMapMultiWrapper
        navigationState={navigationState}
        multiLobby={lobby}
        onMapClick={(clickedPosition) => {
          handlePlacePin(clickedPosition);
        }}
        GoBackButtonRef={goBackButtonRef as RefObject<HTMLElement>}
      />
      <div
        className='above-map'
        ref={goBackButtonRef}
      ></div>
    </>
  );
}
