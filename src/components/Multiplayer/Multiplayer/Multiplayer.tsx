import { useState } from 'react';
import useSWR from 'swr';
import { MULTI_LOBBY_COUNT_LIMIT } from '../../../constants/defaults';
import { createLobby, getLobbies } from '../../../data/jingle-api';
import { LobbySettings, MultiLobby } from '../../../types/jingle';
import Navbar from '../../Navbar/Navbar';
import { Button } from '../../ui-util/Button';
import CreateLobbyModal from '../CreateLobbyModal';
import Matchmaking from '../Matchmaking';
import styles from './Multiplayer.module.css';

const Multiplayer = () => {
  const [createLobbyModalOpen, setCreateLobbyModalOpen] = useState(false);
  const { data: lobbies } = useSWR<MultiLobby[]>(`/api/averages`, getLobbies);
  console.log('LOBBIES:', lobbies);

  const onJoinLobby = (lobbyId) => {
    console.log('blah');
  };
  const onCreateLobby = ({
    lobbyName,
    lobbySettings,
  }: {
    lobbyName: string;
    lobbySettings: LobbySettings;
  }) => {
    if ((lobbies?.length ?? 0) < MULTI_LOBBY_COUNT_LIMIT) {
      createLobby({ name: lobbyName, settings: lobbySettings });
      setCreateLobbyModalOpen(false);
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
        <p>No lobbies available. Create one!</p>
        <Button
          label='Create Lobby'
          disabled={(lobbies?.length ?? 0) >= MULTI_LOBBY_COUNT_LIMIT}
          onClick={() => setCreateLobbyModalOpen(true)}
          classes={'createLobbyBtn'}
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
              <th>Surface</th>
              <th>Underground</th>
              <th>Hard Mode</th>
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
                      onClick={() => onJoinLobby(lobbyId)}
                      classes='multiplayerBtn'
                    ></Button>
                  </td>
                  <td>{lobby.settings?.hardMode ? 'Hard Mode On' : 'Hard Mode Off'}</td>
                  <td>{lobby.settings?.surfaceSelected ? 'Surface On' : 'Surface Off'}</td>
                  <td>
                    {lobby.settings?.undergroundSelected ? 'Underground On' : 'Underground Off'}
                  </td>
                  <td>{lobby.settings?.hardMode ? 'Hard Mode On' : 'Hard Mode Off'}</td>
                  <td>{Object.keys(lobby.settings?.regions)}</td>
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
