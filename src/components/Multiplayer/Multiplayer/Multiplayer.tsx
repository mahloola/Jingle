import Chip from '@mui/material/Chip';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import { useAuth } from '../../../AuthContext';
import { MULTI_LOBBY_COUNT_LIMIT } from '../../../constants/defaults';
import { createLobby, getLobbies, joinLobby } from '../../../data/jingle-api';
import { LobbySettings, MultiLobby } from '../../../types/jingle';
import Navbar from '../../Navbar/Navbar';
import { Button } from '../../ui-util/Button';
import CreateLobbyModal from '../CreateLobbyModal';
import Matchmaking from '../Matchmaking';
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
    <div className={styles.multiplayerContainer}>
      <Navbar />
      <Matchmaking />
      {createLobbyModalOpen && (
        <CreateLobbyModal
          onClose={() => setCreateLobbyModalOpen(false)}
          onCreateLobby={onCreateLobby}
        />
      )}
      <div className={styles.multiplayerTable}>
        <div className={styles.tableHeader}>
          <h1>Current Lobbies ({lobbies?.length})</h1>{' '}
          <Button
            label='Create Lobby'
            disabled={(lobbies?.length ?? 0) >= MULTI_LOBBY_COUNT_LIMIT}
            onClick={() => setCreateLobbyModalOpen(true)}
            classes='multiplayerBtn'
          />
        </div>
        <table className={styles.multiLobbyTable}>
          <thead>
            <tr>
              <th>Lobby Name</th>
              <th>{null}</th>
              <th>{null}</th>
              <th>{null}</th>
              <th>Regions</th>
            </tr>
          </thead>
          <tbody>
            {lobbies?.map((lobby) => {
              return (
                <tr>
                  <td>
                    {lobby.name} &nbsp;&nbsp;
                    <Button
                      label={'Join'}
                      onClick={() => onJoinLobby(lobby.id)}
                      classes='multiplayerBtn'
                    ></Button>
                  </td>
                  <td>
                    {lobby.settings?.hardMode ? (
                      <Chip
                        size='medium'
                        label={`Hard Mode`}
                      />
                    ) : null}
                  </td>
                  <td>
                    {lobby.settings?.undergroundSelected &&
                    lobby.settings?.surfaceSelected ? null : lobby.settings?.undergroundSelected ? (
                      <Chip
                        size='medium'
                        label={`Underground`}
                      />
                    ) : (
                      <Chip
                        size='medium'
                        label={`Surface`}
                      />
                    )}
                  </td>
                  <td style={{ display: 'flex', width: '250%' }}>
                    {Object.keys(lobby.settings?.regions).join(', ')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Multiplayer;
