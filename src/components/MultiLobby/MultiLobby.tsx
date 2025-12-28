import { User } from 'firebase/auth';
import { RefObject, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { match } from 'ts-pattern';
import { useAuth } from '../../AuthContext';
import {
  incrementGlobalGuessCounter,
  incrementSongFailureCount,
  incrementSongSuccessCount,
  leaveLobby,
  updateLobbyState,
} from '../../data/jingle-api';
import { useLobby, useLobbyState } from '../../hooks/useLobbyState';
import { MultiGameState, MultiLobbyStatus, Player } from '../../types/jingle';
import {
  incrementLocalGuessCount,
  loadPreferencesFromBrowser,
  sanitizePreferences,
  updateGuessStreak,
} from '../../utils/browserUtil';
import { SongService } from '../../utils/getRandomSong';
import { playSong } from '../../utils/playSong';
import AudioControlsMulti from '../AudioControlsMulti';
import Footer from '../Footer';
import RoundResult from '../RoundResult';
import RunescapeMap from '../RunescapeMap';
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
  const goBackButtonRef = useRef<HTMLDivElement>(null);
  const { lobbyId } = useParams<{ lobbyId: string }>();
  const lobby = useLobby(lobbyId);
  const lobbyState = useLobbyState(lobbyId);
  const { currentUser }: User = useAuth();
  const currentUserId = currentUser?.uid;

  if (!lobby || !lobbyState || !currentUser) throw Error("Couldn't load lobby or lobby state.");

  console.log('Current game state: ', lobbyState);
  console.log('Current lobby: ', lobby);

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

  const revealScores = (latestGameState: MultiGameState | undefined) => {
    if (!latestGameState) return;
    // loop through all the players pin placements inside
    // evaluate their scores 0-1000 each
    // add to results array
    // update leaderboard
    // push current round to rounds[]
    // create a new current round with a new song but empty pins, results etc

    for (let i = 0; i < latestGameState.currentRound.pins.length; i++) {
      incrementGlobalGuessCounter();
      const currentSong = latestGameState.currentRound.songName;
      const userResult = latestGameState.currentRound.results.find(
        (result) => result.userId === currentUserId,
      );
      const correct = userResult?.score === 1000;
      if (correct) {
        incrementSongSuccessCount(currentSong);
        incrementLocalGuessCount(true);
        updateGuessStreak(true);
      } else {
        incrementSongFailureCount(currentSong);
        incrementLocalGuessCount(false);
        updateGuessStreak(false);
      }
    }
  };

  // watch for if all users have confirmed their guesses
  useEffect(() => {
    revealScores(lobbyState);
  }, [lobbyState]);

  useEffect(() => {
    if (!lobbyState) return;
    const allConfirmed = lobbyState.currentRound.pins.every((pin) => pin.pin.confirmed);
    const anyChanged = lobbyState.currentRound.pins.some((pin) => pin.pin.confirmed);

    if (allConfirmed) {
      console.log('All users confirmed, revealing scores...');
      revealScores(lobbyState);
    } else if (anyChanged) {
      console.log('Some user confirmed their guess.');
    }
  }, [lobbyState?.currentRound.pins]);

  const handleMapClick = (clickedPosition) => {
    const newGameState = jingle.setClickedPosition(clickedPosition);
    if (!currentPreferences.preferConfirmation) {
      confirmGuess(newGameState); // confirm immediately
    }
  };
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
            <NewsModalButton />
            <StatsModalButton />
            <HistoryModalButton />
          </div>

          <div className='below-map'>
            {match(lobbyState.status)
              .with(MultiLobbyStatus.Playing, () => (
                <label className='osrs-frame guess-btn'>Place your pin on the map</label>
              ))
              .with(MultiLobbyStatus.Revealing, () => (
                <Button
                  classes={'guess-btn'}
                  label='Next Song'
                  onClick={nextSong}
                />
              ))
              .with(MultiLobbyStatus.Waiting, () => (
                <Button
                  classes={'guess-btn'}
                  label='Waiting...'
                  onClick={() => console.log('nothingburger')}
                />
              ))
              .with(MultiLobbyStatus.Stopped, () => (
                <Button
                  classes={'guess-btn'}
                  label='Game is over'
                  onClick={() => console.log('nothingburger')}
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

      <RunescapeMap
        gameState={lobbyState}
        onMapClick={(clickedPosition) => {
          handleMapClick(clickedPosition);
        }}
        GoBackButtonRef={goBackButtonRef as RefObject<HTMLElement>}
      />
      <div
        className='above-map'
        ref={goBackButtonRef}
      ></div>

      <RoundResult gameState={lobbyState} />
    </>
  );
}
