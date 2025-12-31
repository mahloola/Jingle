import { RefObject, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { match } from 'ts-pattern';
import { useAuth } from '../../AuthContext';
import { leaveLobby, updateLobbyState } from '../../data/jingle-api';
import { useLobby } from '../../hooks/useLobbyState';
import {
  ClickedPosition,
  MultiGameState,
  MultiLobby,
  MultiLobbyStatus,
  NavigationState,
  Player,
} from '../../types/jingle';
import { loadPreferencesFromBrowser, sanitizePreferences } from '../../utils/browserUtil';
import { SongService } from '../../utils/getRandomSong';
import { playSong } from '../../utils/playSong';
import AudioControlsMulti from '../AudioControlsMulti';
import Footer from '../Footer';
import { MultiCountdown } from '../MultiCountdown';
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
  const [guessConfirmed, setGuessConfirmed] = useState(false);

  const goBackButtonRef = useRef<HTMLDivElement>(null);
  const { lobbyId } = useParams<{ lobbyId: string }>();
  const lobby = useLobby(lobbyId);
  const lobbyState = lobby?.gameState;

  const { currentUser } = useAuth();
  const currentUserId = currentUser?.uid;

  const [navigationState, setNavigationState] = useState<NavigationState>({
    clickedPosition: null,
    navigationStack: [],
  });

  if (!lobby || !lobbyState || !currentUser) throw Error("Couldn't load lobby or lobby state.");

  const navigate = useNavigate();
  const currentPreferences = loadPreferencesFromBrowser();

  const audioRef = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    const songName = lobbyState.currentRound?.songName;
    playSong(
      audioRef,
      songName,
      currentPreferences.preferOldAudio,
      lobby.settings.hardModeLength ?? null,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lobbyState]);

  const revealScores = async (latestGame: MultiLobby | undefined) => {
    if (!latestGame) return;
    const newSongName = songService.getRandomSongMulti(latestGame.settings);
    const oldRounds = [...latestGame.gameState.rounds, latestGame.gameState.currentRound];
    const updatedGameState: MultiGameState = {
      ...lobbyState, // This assumes lobbyState is already a MultiGameState
      status: MultiLobbyStatus.Revealing,
      currentRound: {
        // If you want to keep pins unchanged, just spread them:
        pins: [], // Or remove this line entirely
        startTime: new Date(),
        endTime: new Date(Date.now() + 30000),
        // Make sure all required fields are preserved:
        id: '12345',
        songName: newSongName,
        results: [],
        leaderboard: [],
      },
      rounds: oldRounds,
    };

    const token = await currentUser.getIdToken();
    if (!lobbyId || !token) {
      throw Error("Couldn't update - missing lobbyId/token");
    }
    if (!latestGame || !currentUserId) return null;

    await updateLobbyState({ lobbyId, newState: updatedGameState, token });

    // updateLobbyState();
    // if (!latestGameState) return;
    // // loop through all the players pin placements inside
    // // evaluate their scores 0-1000 each
    // // add to results array
    // // update leaderboard
    // // push current round to rounds[]
    // // create a new current round with a new song but empty pins, results etc

    // for (let i = 0; i < latestGameState.currentRound.pins.length; i++) {
    //   incrementGlobalGuessCounter();
    //   const currentSong = latestGameState.currentRound.songName;
    //   const userResult = latestGameState.currentRound.results.find(
    //     (result) => result.userId === currentUserId,
    //   );
    //   const correct = userResult?.score === 1000;
    //   if (correct) {
    //     incrementSongSuccessCount(currentSong);
    //     incrementLocalGuessCount(true);
    //     updateGuessStreak(true);
    //   } else {
    //     incrementSongFailureCount(currentSong);
    //     incrementLocalGuessCount(false);
    //     updateGuessStreak(false);
    //   }
    // }
  };

  // useEffect(() => {
  //   if (!lobbyState) return;
  //   const allConfirmed = lobbyState.currentRound?.pins?.every((pin) => pin.pin.confirmed);
  //   const anyChanged = lobbyState.currentRound?.pins?.some((pin) => pin.pin.confirmed);

  //   if (allConfirmed) {
  //     console.log('All users confirmed, revealing scores...');
  //     revealScores(lobby);
  //   } else if (anyChanged) {
  //     console.log('Some user confirmed their guess.');
  //   }
  // }, [lobbyState?.currentRound.pins]);

  const handleMapClick = (clickedPosition: ClickedPosition) => {
    setNavigationState((prev) => ({
      ...prev,
      clickedPosition: clickedPosition,
    }));
  };

  useEffect(() => {
    const userGuess = lobbyState?.currentRound?.pins.find((pin) => pin.userId === currentUserId);
    if (!userGuess) return;
    if (!lobbyState?.currentRound?.endTime) return;
    if (new Date(Date.now()).getTime() > new Date(lobbyState?.currentRound?.endTime).getTime()) {
      revealScores(lobby);
    }
  }, [lobbyState]);

  const confirmGuess = async ({
    latestGameState,
  }: {
    latestGameState: MultiGameState | undefined;
  }) => {
    const token = await currentUser.getIdToken();
    if (!lobbyId || !token) {
      throw Error("Couldn't update - missing lobbyId/token");
    }
    if (!latestGameState || !currentUserId) return null;

    // Find user's pin
    const userPinIndex = latestGameState.currentRound.pins.findIndex(
      (pin) => pin.userId === currentUserId,
    );

    if (userPinIndex === -1) {
      throw new Error("Couldn't find your pin to confirm.");
    }

    // Create NEW game state with immutable update
    const updatedGameState: MultiGameState = {
      ...latestGameState,
      currentRound: {
        ...latestGameState.currentRound,
        pins: latestGameState.currentRound.pins.map((pin, index) =>
          index === userPinIndex
            ? {
                ...pin,
                pin: {
                  ...pin.pin,
                  confirmed: true,
                },
              }
            : pin,
        ),
      },
    };
    await updateLobbyState({ lobbyId, newState: updatedGameState, token });
    return updatedGameState;
  };

  const nextSong = () => {
    const newSong = songService.getRandomSong(currentPreferences);
    // push new song to game state on server
    songService.removeSong(newSong);
    playSong(
      audioRef,
      newSong,
      currentPreferences.preferOldAudio,
      ...(currentPreferences.preferHardMode ? [currentPreferences.hardModeLength] : []),
    );
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

  const handleStartGame = async () => {
    // Create NEW game state with immutable update
    const token = await currentUser.getIdToken();
    if (!token || !lobbyId) {
      throw Error('Could not start game.');
    }
    const updatedGameState: MultiGameState = {
      ...lobbyState, // This assumes lobbyState is already a MultiGameState
      status: MultiLobbyStatus.Playing,
      currentRound: {
        ...lobbyState.currentRound,
        // If you want to keep pins unchanged, just spread them:
        pins: [...lobbyState.currentRound.pins], // Or remove this line entirely
        startTime: new Date(),
        endTime: new Date(Date.now() + 30000),
        // Make sure all required fields are preserved:
        id: lobbyState.currentRound.id,
        songName: lobbyState.currentRound.songName,
        results: lobbyState.currentRound.results ? [...lobbyState.currentRound.results] : [],
        leaderboard: lobbyState.currentRound.leaderboard
          ? [...lobbyState.currentRound.leaderboard]
          : [],
      },
      // Preserve rounds array
      rounds: lobbyState.rounds ? [...lobbyState.rounds] : [],
    };
    await updateLobbyState({ lobbyId, newState: updatedGameState, token });
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
              {lobby.gameState?.currentRound?.endTime && (
                <h2>
                  <MultiCountdown targetDate={new Date(lobby.gameState?.currentRound?.endTime)} />
                </h2>
              )}
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
            <NewsModalButton />
            <StatsModalButton />
            <HistoryModalButton />
          </div>

          <div className='below-map'>
            {match(lobbyState.status)
              .with(MultiLobbyStatus.Playing, () => (
                <Button
                  classes={'guess-btn'}
                  label={guessConfirmed ? 'Waiting for others...' : 'Confirm Guess'}
                  onClick={() => {
                    setGuessConfirmed(true);
                    revealScores(lobby);
                  }}
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
        multiGameState={lobbyState}
        onMapClick={(clickedPosition) => {
          handleMapClick(clickedPosition);
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
