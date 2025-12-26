import { useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLobby, useLobbyState } from '../../hooks/useLobbyState';
import { loadPreferencesFromBrowser, sanitizePreferences } from '../../utils/browserUtil';
import { SongService } from '../../utils/getRandomSong';
sanitizePreferences();

const songService: SongService = SongService.Instance();
// starting song list - put outside component so it doesn't re-construct with rerenders

export default function MultiplayerLobby() {
  const { lobbyId } = useParams<{ lobbyId: string }>();
  const lobby = useLobby(lobbyId);
  const lobbyState = useLobbyState(lobbyId);
  console.log('Current game state: ', lobbyState);
  console.log('Current lobby: ', lobby);

  const navigate = useNavigate();
  const goBackButtonRef = useRef<HTMLDivElement>(null);
  const currentPreferences = loadPreferencesFromBrowser();

  // const audioRef = useRef<HTMLAudioElement>(null);
  // useEffect(() => {
  //   const songName = gameState.songs[gameState.round];
  //   playSong(
  //     audioRef,
  //     songName,
  //     currentPreferences.preferOldAudio,
  //     ...(currentPreferences.preferHardMode ? [currentPreferences.hardModeLength] : []),
  //   );
  //   songService.removeSong(songName);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // const confirmGuess = (latestGameState?: GameState) => {
  //   const gameState = jingle.confirmGuess(latestGameState);

  //   // update statistics
  //   incrementGlobalGuessCounter();
  //   const currentSong = gameState.songs[gameState.round];
  //   const correct = gameState.scores[gameState.round] === 1000;
  //   if (correct) {
  //     incrementSongSuccessCount(currentSong);
  //     incrementLocalGuessCount(true);
  //     updateGuessStreak(true);
  //   } else {
  //     incrementSongFailureCount(currentSong);
  //     incrementLocalGuessCount(false);
  //     updateGuessStreak(false);
  //   }
  // };

  // const nextSong = () => {
  //   const newSong = songService.getRandomSong(currentPreferences);
  //   // push new song to game state on server
  //   songService.removeSong(newSong);
  //   playSong(
  //     audioRef,
  //     newSong,
  //     currentPreferences.preferOldAudio,
  //     ...(currentPreferences.preferHardMode ? [currentPreferences.hardModeLength] : []),
  //   );
  // };

  // const handleExitLobby = async () => {
  //   const token = await currentUser?.getIdToken();
  //   if (!lobbyId || !token) return;
  //   try {
  //     leaveLobby({ lobbyId, token });
  //     navigate('/multiplayer');
  //   } catch (err) {
  //     console.error('Failed to leave lobby: ', err);
  //   }
  // };

  // return (
  //   <>
  //     <div className='App-inner'>
  //       <div className='ui-box'>
  //         <aside className={styles.playersContainer}>
  //           <div className={`osrs-frame ${styles.lobbyInfo}`}>
  //             <h2>{lobby.name}</h2>
  //             {lobby.players?.length > 1 ? `${lobby.players?.length} Players` : null}
  //           </div>
  //           {lobby.players.map((player: Player) => {
  //             return (
  //               <div
  //                 key={player?.id}
  //                 className={`osrs-frame ${styles.playerContainer}`}
  //               >
  //                 <h3 className={styles.playerRank}>#1</h3>
  //                 {player?.avatarUrl ? (
  //                   <img
  //                     src={player?.avatarUrl}
  //                     alt='player-picture'
  //                     className={styles.playerPicture}
  //                   />
  //                 ) : (
  //                   <img
  //                     src={
  //                       'https://i.pinimg.com/474x/18/b9/ff/18b9ffb2a8a791d50213a9d595c4dd52.jpg'
  //                     }
  //                     alt='player-picture'
  //                     className={styles.playerPicture}
  //                   />
  //                 )}
  //                 <span className={styles.playerInfo}>
  //                   {player?.username}
  //                   <br />
  //                   4278 Points
  //                 </span>
  //               </div>
  //             );
  //           })}
  //           <Button
  //             classes={'guess-btn osrs-frame'}
  //             label='Exit Lobby'
  //             onClick={handleExitLobby}
  //           />
  //         </aside>
  //         <div className='modal-buttons-container'>
  //           <HomeButton />
  //           <SettingsModalButton
  //             currentPreferences={currentPreferences}
  //             onApplyPreferences={(preferences: UserPreferences) => updatePreferences(preferences)}
  //             page={Page.Practice}
  //           />
  //           <NewsModalButton />
  //           <StatsModalButton />
  //           <HistoryModalButton />
  //         </div>

  //         <div className='below-map'>
  //           {match(gameState.status)
  //             .with(GameStatus.Guessing, () => {
  //               if (currentPreferences.preferConfirmation) {
  //                 return (
  //                   <Button
  //                     classes={'guess-btn'}
  //                     label='Confirm guess'
  //                     onClick={() => confirmGuess()}
  //                     disabled={!gameState.clickedPosition}
  //                   />
  //                 );
  //               } else {
  //                 return <label className='osrs-frame guess-btn'>Place your pin on the map</label>;
  //               }
  //             })
  //             .with(GameStatus.AnswerRevealed, () => (
  //               <Button
  //                 classes={'guess-btn'}
  //                 label='Next Song'
  //                 onClick={nextSong}
  //               />
  //             ))
  //             .with(GameStatus.GameOver, () => {
  //               throw new Error('Unreachable');
  //             })
  //             .exhaustive()}
  //           <AudioControls
  //             ref={audioRef}
  //             gameState={gameState}
  //           />
  //           <Footer />
  //         </div>
  //       </div>
  //     </div>

  //     <RunescapeMap
  //       gameState={gameState}
  //       onMapClick={(clickedPosition) => {
  //         const newGameState = jingle.setClickedPosition(clickedPosition);
  //         if (!currentPreferences.preferConfirmation) {
  //           confirmGuess(newGameState); // confirm immediately
  //         }
  //       }}
  //       GoBackButtonRef={goBackButtonRef as RefObject<HTMLElement>}
  //     />
  //     <div
  //       className='above-map'
  //       ref={goBackButtonRef}
  //     ></div>

  //     <RoundResult gameState={gameState} />
  //   </>
  // );

  return <h1>hello world</h1>;
}
