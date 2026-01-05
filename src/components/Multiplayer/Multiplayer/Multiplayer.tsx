import Chip from '@mui/material/Chip';
import React, { useState } from 'react';
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

// Pagination constants
const LOBBIES_PER_PAGE = 4;

const Multiplayer = () => {
  const { currentUser } = useAuth();
  const [createLobbyModalOpen, setCreateLobbyModalOpen] = useState(false);
  const [isCreatingLobby, setIsCreatingLobby] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { data: lobbies, mutate: mutateLobbies } = useSWR<MultiLobby[]>(`/api/lobbies`, getLobbies); // todo: only need to fetch x lobby

  const navigate = useNavigate();

  // Calculate pagination values
  const totalLobbies = lobbies?.length || 0;
  const totalPages = Math.ceil(totalLobbies / LOBBIES_PER_PAGE);
  const startIndex = (currentPage - 1) * LOBBIES_PER_PAGE;
  const endIndex = startIndex + LOBBIES_PER_PAGE;
  const currentLobbies = lobbies?.slice(startIndex, endIndex) || [];

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

    // Prevent multiple simultaneous creations
    if (isCreatingLobby) {
      return;
    }

    setIsCreatingLobby(true);

    try {
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
        // You might want to show this error to the user
      }
    } catch (error) {
      console.error('Failed to create lobby:', error);
      // Handle error - show error message to user
    } finally {
      setIsCreatingLobby(false);
    }

    return null;
  };

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!lobbies || lobbies.length === 0 || lobbies == undefined) {
    return (
      <div className={styles.multiplayerContainerEmpty}>
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
            <h1 className={styles.title}>Current Lobbies ({totalLobbies})</h1>{' '}
            <Button
              label='Create Lobby'
              disabled={(lobbies?.length ?? 0) >= MULTI_LOBBY_COUNT_LIMIT}
              onClick={() => setCreateLobbyModalOpen(true)}
              classes='multiplayerBtn'
            />
          </div>

          {currentLobbies.map((lobby) => {
            const lobbyOwner = lobby.players.find((player) => player.id === lobby.ownerId);
            return (
              <div
                className={styles.lobbyContainer}
                onClick={() => onJoinLobby(lobby.id)}
                key={lobby.id}
              >
                <img
                  src={lobbyOwner?.avatarUrl ?? DEFAULT_PFP_URL}
                  className={styles.ownerPfp}
                />

                <div className={styles.lobbyNameAndPlayerCount}>
                  <h2 className={styles.lobbyName}>{lobby.name}</h2>
                  <h4 className={styles.playerCount}>
                    {lobby.players?.length === 1
                      ? `${lobby.players?.length} Player`
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

          {/* pagination */}
          {totalPages > 1 && (
            <div className={styles.paginationContainer}>
              <div className={styles.paginationInfo}>
                Showing {startIndex + 1}-{Math.min(endIndex, totalLobbies)} of {totalLobbies}{' '}
                lobbies
              </div>

              <div className={styles.paginationControls}>
                <button
                  className={`${styles.pageButton} ${currentPage === 1 ? styles.disabled : ''}`}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ← Previous
                </button>

                <div className={styles.pageNumbers}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      // Show first page, last page, current page, and pages around current
                      if (page === 1 || page === totalPages) return true;
                      if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                      return false;
                    })
                    .map((page, index, array) => {
                      // Add ellipsis for skipped pages
                      const prevPage = array[index - 1];
                      const showEllipsis = prevPage && page - prevPage > 1;

                      return (
                        <React.Fragment key={page}>
                          {showEllipsis && <span className={styles.ellipsis}>...</span>}
                          <button
                            className={`${styles.pageButton} ${
                              currentPage === page ? styles.active : ''
                            }`}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>

                <button
                  className={`${styles.pageButton} ${
                    currentPage === totalPages ? styles.disabled : ''
                  }`}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Multiplayer;
