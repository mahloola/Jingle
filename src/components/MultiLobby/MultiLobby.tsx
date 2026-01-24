import { User } from 'firebase/auth';
import { RefObject, useEffect, useRef, useState } from 'react';
import { FaCheck } from 'react-icons/fa';
import { FaCircleMinus } from 'react-icons/fa6';
import { useNavigate, useParams } from 'react-router-dom';
import { match } from 'ts-pattern';
import { useAuth } from '../../AuthContext';
import { DEFAULT_PFP_URL } from '../../constants/defaults';
import { joinLobby, kickPlayer, leaveLobby, startLobby } from '../../data/jingle-api';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useLobbyWebSocket } from '../../hooks/useLobbyWebSocket';
import {
  ClickedPosition,
  LobbySettings,
  MultiLobbyStatus,
  NavigationState,
  Player,
} from '../../types/jingle';
import { assertLobbyAndUser } from '../../utils/assert';
import { loadPreferencesFromBrowser, sanitizePreferences } from '../../utils/browserUtil';
import { findNearestPolygonWhereSongPlays } from '../../utils/map-utils';
import { playSong } from '../../utils/playSong';
import { calcGradientColor } from '../../utils/string-utils';
import AudioControlsMulti from '../AudioControlsMulti';
import Footer from '../Footer';
import Modal from '../Modal';
import MultiLobbyChat from '../MultiLobbyChat/MultiLobbyChat';
import MultiSettingsModal from '../MultiSettingsModal/MultiSettingsModal';
import RoundResultMulti from '../RoundResultMulti';
import RunescapeMapMultiWrapper from '../RunescapeMapMulti';
import HistoryModalButton from '../side-menu/HistoryModalButton';
import HomeButton from '../side-menu/HomeButton';
import NewsModalButton from '../side-menu/NewsModalButton';
import ReportModalButton from '../side-menu/ReportModalButton';
import StatsModalButton from '../side-menu/StatsModalButton';
import { Button } from '../ui-util/Button';
import styles from './MultiLobby.module.css';
sanitizePreferences();

const enterUserIntoLobby = async (user: User, lobbyId: string) => {
  const token = await user.getIdToken();
  joinLobby({ lobbyId, token });
};

export default function MultiplayerLobby() {
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.uid;
  const { lobbyId } = useParams<{ lobbyId: string }>();
  const isMobile = useIsMobile();
  const { lobby, timeLeft, socket } = useLobbyWebSocket(lobbyId, currentUserId);
  const navigate = useNavigate();
  const userInLobby = lobby?.players?.find((player) => player.id === currentUserId);

  const [kickPlayerModalOpen, setKickPlayerModalOpen] = useState(false);
  const [playerToKick, setPlayerToKick] = useState<Player | null>(null);

  const hardModeStartOffset = lobby?.gameState.currentRound.hardModeStartOffset;
  const hardModeEndOffset = lobby?.gameState.currentRound.hardModeEndOffset;

  // if (!userInLobby && lobby?.settings.hasPassword === false) {
  //   if (currentUser && lobbyId) enterUserIntoLobby(currentUser, lobbyId);
  // } else {
  //   navigate('/multiplayer');
  // }

  if (!userInLobby && currentUser && lobbyId) {
    if (lobby?.settings.hasPassword) {
      navigate('/multiplayer');
    } else {
      enterUserIntoLobby(currentUser, lobbyId);
    }
  }

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

  // just for hard mode
  const currentPreferences = loadPreferencesFromBrowser();

  const audioRef = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    const wasPlaying = prevStatusRef.current === MultiLobbyStatus.Playing;
    const isPlaying = lobbyState?.status === MultiLobbyStatus.Playing;

    // Only run if status CHANGED to Playing
    if (!wasPlaying && isPlaying) {
      const songName = lobbyState.currentRound?.songName;
      playSong(
        audioRef,
        songName,
        currentPreferences.preferOldAudio,
        lobby?.settings.hardMode ? lobby?.settings.hardModeLength : undefined,
        hardModeStartOffset,
        hardModeEndOffset,
      );
    }
    setGuessConfirmed(false);
    // Update the ref for next time
    prevStatusRef.current = lobbyState?.status;
  }, [lobbyState?.status /* other dependencies */]);

  const handlePlacePin = async (clickedPosition: ClickedPosition) => {
    if (guessConfirmed) return;
    if (lobby?.gameState.status !== MultiLobbyStatus.Playing) {
      return;
    }
    setNavigationState((prev) => ({
      ...prev,
      clickedPosition: clickedPosition,
    }));

    const { lobbyId: id, token } = await assertLobbyAndUser({
      lobbyId: lobbyId,
      currentUser: currentUser ?? undefined,
    });

    const distance = lobbyState?.currentRound?.songName
      ? findNearestPolygonWhereSongPlays(lobbyState?.currentRound?.songName, clickedPosition)
          .distance
      : 0;

    socket.emit('place-pin', { lobbyId: id, currentUserId, clickedPosition, distance });
  };

  const handleSettingsUpdate = async ({
    newSettings,
    newName,
  }: {
    newSettings: LobbySettings;
    newName: string;
  }) => {
    socket.emit('update-lobby-settings', newSettings, newName, lobbyId);
  };

  const handleConfirmGuess = async () => {
    const { lobbyId: id, token } = await assertLobbyAndUser({
      lobbyId,
      currentUser: currentUser ?? undefined,
    });
    socket.emit('confirm-pin', { lobbyId: id, currentUserId });
    setGuessConfirmed(true);
  };

  const handleKickPlayer = (player: Player) => {
    setPlayerToKick(player);
    setKickPlayerModalOpen(true);
  };

  const handleKickPlayerConfirm = async () => {
    const token = await currentUser?.getIdToken();
    try {
      await kickPlayer({ lobbyId, playerId: playerToKick?.id, token });
      setKickPlayerModalOpen(false);
    } catch (err) {
      console.error('Could not kick player from lobby: ', err);
    }
  };

  const handleExitLobby = async () => {
    const { lobbyId: id, token } = await assertLobbyAndUser({
      lobbyId: lobbyId,
      currentUser: currentUser ?? undefined,
    });
    try {
      leaveLobby({ lobbyId: id, token });
      navigate('/multiplayer');
    } catch (err) {
      console.error('Failed to leave lobby: ', err);
    }
  };

  const handleStartGame = async () => {
    const { lobbyId: id, token } = await assertLobbyAndUser({
      lobbyId: lobbyId,
      currentUser: currentUser ?? undefined,
    });
    try {
      await startLobby({ lobbyId: id, token });
    } catch (err) {
      console.error('Failed to start lobby: ', err);
    }
  };

  if (!lobbyId || !currentUser || !lobbyState || !lobby) {
    return <h1>Lobby not found!</h1>;
  }

  const playersConfirmed = new Map<string, boolean>();
  const sortedPlayersWithData = lobby.players
    .map((player) => {
      const playerScore = lobby.gameState.currentRound.results.find(
        (result) => result.userId === player.id,
      )?.score;
      const playerLbEntry = lobby.gameState.leaderboard?.find(
        (lbEntry) => lbEntry.userId === player.id,
      );
      const playerPin = lobby.gameState.currentRound.pins.find((pin) => pin.userId === player.id);
      const playerConfirmed = playerPin?.details?.confirmed == true;
      playersConfirmed.set(player.id, playerConfirmed ?? false);

      return {
        player,
        score: playerScore,
        lbEntry: playerLbEntry,
        rank: playerLbEntry?.rank || Infinity,
      };
    })
    .sort((a, b) => a.rank - b.rank); // Sort by rank

  const maxLength = isMobile ? 4 : 12;
  const lobbyName =
    lobby.name.length > maxLength ? `${lobby.name.slice(0, maxLength)}..` : lobby.name;

  return (
    <>
      <Modal
        open={kickPlayerModalOpen}
        onClose={() => setKickPlayerModalOpen(false)}
        onApplySettings={handleKickPlayerConfirm}
        primaryButtonText='Yes'
      >
        <h4 style={{ margin: '20px', textAlign: 'center' }}>
          Are you sure you want to kick{' '}
          <span style={{ color: 'white' }}>{playerToKick?.username}</span>?
        </h4>
      </Modal>
      <div className='App-inner'>
        <MultiLobbyChat
          socket={socket}
          lobby={lobby}
          currentUser={currentUser}
        />

        <div className='ui-box'>
          <aside className={`${styles.playersContainer} ${styles.halfOpacityGradient}`}>
            <div className={`osrs-frame ${styles.lobbyInfo}`}>
              <h2>{lobbyName}</h2>
              {lobby.players?.length > 1 ? `${lobby.players?.length} Players` : null}
              <div className={styles.status}>
                {lobby.gameState.status === MultiLobbyStatus.Revealing
                  ? 'Next song in...'
                  : lobby.gameState.status}
              </div>
              {lobby.gameState?.currentPhaseEndTime &&
                lobby.gameState.status !== MultiLobbyStatus.Waiting && <h2>{timeLeft}</h2>}
            </div>
            <div
              className={`${styles.playerList} ${lobby.players.length > 5 ? styles.opacityGradient : ''}`}
            >
              {sortedPlayersWithData.map(({ player, score, lbEntry }) => (
                <div
                  key={player.id}
                  className={`osrs-frame ${styles.playerContainer}`}
                >
                  {isMobile ? (
                    /* MOBILE VERSION */
                    <div className={styles.playerContainerMobile}>
                      <span className={styles.playerRankMobile}>#{lbEntry?.rank ?? '--'}</span>
                      <img
                        src={player.avatarUrl || DEFAULT_PFP_URL}
                        alt='player-picture'
                        className={styles.playerPicture}
                      />
                      {playersConfirmed.get(player.id) && !isMobile ? <FaCheck /> : null}
                    </div>
                  ) : lobbyState?.status === MultiLobbyStatus.Revealing ? (
                    /* DESKTOP REVEAL */
                    <div className={styles.playerContainerSimple}>
                      <img
                        src={player.avatarUrl || DEFAULT_PFP_URL}
                        alt='player-picture'
                        className={styles.playerPicture}
                      />
                      <h1
                        className={styles.playerScore}
                        style={{
                          color: calcGradientColor({ val: score ?? 0, min: -300, max: 1000 }),
                        }}
                      >
                        {score ? `+${score}` : '-'}
                      </h1>
                      {currentUserId === lobby.ownerId && player.id !== currentUserId && (
                        <div
                          className={styles.kickPlayerIcon}
                          onClick={() => handleKickPlayer(player)}
                        >
                          <FaCircleMinus />
                        </div>
                      )}
                    </div>
                  ) : (
                    /* DESKTOP DETAILS */
                    <div className={styles.playerContainerDetails}>
                      <h3 className={styles.playerRank}>#{lbEntry?.rank ?? '--'}</h3>
                      <img
                        src={player.avatarUrl || DEFAULT_PFP_URL}
                        alt='player-picture'
                        className={styles.playerPicture}
                      />
                      <span className={styles.playerInfo}>
                        <span className={styles.playerUsername}>
                          {player.username} {player.id === lobby.ownerId ? '🔑' : null}
                          {playersConfirmed.get(player.id) ? <FaCheck /> : null}
                        </span>
                        {lbEntry?.score ?? '---'} Points
                      </span>
                      {currentUserId === lobby.ownerId && player.id !== currentUserId && (
                        <div
                          className={styles.kickPlayerIcon}
                          onClick={() => handleKickPlayer(player)}
                        >
                          <FaCircleMinus />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Button
              classes={`${styles.exitLobbyBtn} guess-btn osrs-frame`}
              label='Exit Lobby'
              onClick={handleExitLobby}
            />
          </aside>
          <div className='modal-buttons-container'>
            <span style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <ReportModalButton />
              <HomeButton />
            </span>
            <NewsModalButton />
            <StatsModalButton />
            <HistoryModalButton />
            {currentUserId === lobby.ownerId && (
              <MultiSettingsModal
                onEditLobby={({ lobbySettings, lobbyName }) =>
                  handleSettingsUpdate({ newSettings: lobbySettings, newName: lobbyName })
                }
                lobby={lobby}
              />
            )}
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
            {!isMobile && <Footer />}
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
      <RoundResultMulti
        multiGameState={lobbyState}
        userId={currentUserId}
      />
    </>
  );
}
