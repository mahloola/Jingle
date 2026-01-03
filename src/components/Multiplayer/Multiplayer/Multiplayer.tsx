import Chip from '@mui/material/Chip';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import { useAuth } from '../../../AuthContext';
import { DEFAULT_PFP_URL, MULTI_LOBBY_COUNT_LIMIT } from '../../../constants/defaults';
import { createLobby, getLobbies, joinLobby } from '../../../data/jingle-api';
import { LobbySettings, MultiLobby } from '../../../types/jingle';
import Navbar from '../../Navbar/Navbar';
import { Button } from '../../ui-util/Button';
import CreateLobbyModal from '../CreateLobbyModal';
import styles from './Multiplayer.module.css';

const Multiplayer = () => {
  const { currentUser } = useAuth();
  const [createLobbyModalOpen, setCreateLobbyModalOpen] = useState(false);
  const { data: lobbies, mutate: mutateLobbies } = useSWR<MultiLobby[]>(`/api/lobbies`, getLobbies); // todo: only need to fetch x lobby

  const navigate = useNavigate();

  const onJoinLobby = async (lobbyId: string) => {
    if (!currentUser) {
      console.error('No user logged in');
      return;
    }
    try {
      const token = await currentUser.getIdToken();
      await joinLobby({ lobbyId, token });
      navigate(`/multiplayer/${lobbyId}`);
    } catch (error) {
      console.error('Failed to join lobby:', error);
    }
  };

  const onCreateLobby = async ({
    lobbyName,
    lobbySettings,
  }: {
    lobbyName: string;
    lobbySettings: LobbySettings;
  }) => {
    if (!currentUser) {
      console.error('No user logged in');
      return;
    }
    const token = await currentUser.getIdToken();
    if ((lobbies?.length ?? 0) < MULTI_LOBBY_COUNT_LIMIT) {
      const { lobby: newLobby } = await createLobby({
        name: lobbyName,
        settings: lobbySettings,
        token,
      });
      // OPTIMISTIC UPDATE: immediately update UI
      mutateLobbies([...(lobbies || []), newLobby], false);

      mutateLobbies(); // re-fetch after
      setCreateLobbyModalOpen(false);
      navigate(`/multiplayer/${newLobby.id}`);
    } else {
      console.error('Lobby count exceeded! Please wait and try again later.');
    }
    return null;
  };

  if (!lobbies || lobbies.length === 0 || lobbies == undefined) {
    return (
      <div className={styles.multiplayerContainer}>
        {createLobbyModalOpen && (
          <CreateLobbyModal
            onClose={() => setCreateLobbyModalOpen(false)}
            onCreateLobby={onCreateLobby}
          />
        )}
        <h1>No lobbies available. Create one!</h1>
        <Button
          label='Create Lobby'
          disabled={(lobbies?.length ?? 0) >= MULTI_LOBBY_COUNT_LIMIT}
          onClick={() => setCreateLobbyModalOpen(true)}
          classes='multiplayerBtnLarge'
        />
      </div>
    );
  }

  return (
    <>
      <Navbar />{' '}
      <div className={styles.multiplayerContainer}>
        {createLobbyModalOpen && (
          <CreateLobbyModal
            onClose={() => setCreateLobbyModalOpen(false)}
            onCreateLobby={onCreateLobby}
          />
        )}
        <div className={`osrs-frame ${styles.multiplayerContainer}`}>
          <div className={styles.header}>
            {' '}
            <h1 className={styles.title}>Current Lobbies ({lobbies?.length})</h1>{' '}
            <Button
              label='Create Lobby'
              disabled={(lobbies?.length ?? 0) >= MULTI_LOBBY_COUNT_LIMIT}
              onClick={() => setCreateLobbyModalOpen(true)}
              classes='multiplayerBtn'
            />
          </div>

          {lobbies?.map((lobby) => {
            const lobbyOwner = lobby.players.find((player) => player.id === lobby.ownerId);
            return (
              <div
                className={styles.lobbyContainer}
                onClick={() => onJoinLobby(lobby.id)}
              >
                <img
                  src={lobbyOwner?.avatarUrl ?? DEFAULT_PFP_URL}
                  className={styles.ownerPfp}
                />

                <div className={styles.lobbyNameAndPlayerCount}>
                  <h2 className={styles.lobbyName}>{lobby.name}</h2>
                  <h4 className={styles.playerCount}>
                    {lobby.players?.length === 1
                      ? `${lobby.players?.length} Players`
                      : `${lobby.players?.length} Players`}
                  </h4>
                </div>
                {lobby.settings?.hardMode ? (
                  <Chip
                    size='medium'
                    color='error'
                    label={`Hard Mode`}
                  />
                ) : (
                  <Chip
                    size='medium'
                    color='success'
                    label={`Standard Mode`}
                  />
                )}
                {lobby.settings?.undergroundSelected && lobby.settings?.surfaceSelected ? (
                  <Chip
                    size='medium'
                    color='info'
                    label={`Underground, Surface`}
                  />
                ) : lobby.settings?.undergroundSelected ? (
                  <Chip
                    size='medium'
                    color='error'
                    label={`Underground`}
                  />
                ) : (
                  <Chip
                    size='medium'
                    color='success'
                    label={`Surface`}
                  />
                )}
                <Chip
                  size='medium'
                  color='success'
                  label={Object.keys(lobby.settings?.regions).join(', ')}
                />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Multiplayer;
