import Chip from '@mui/material/Chip';
import React, { useMemo, useState } from 'react';
import { FaChevronDown, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import { useAuth } from '../../../AuthContext';
import {
  DEFAULT_LOBBY_FILTERS,
  DEFAULT_PFP_URL,
  MULTI_LOBBY_COUNT_LIMIT,
} from '../../../constants/defaults';
import { createLobby, getLobbies, joinLobby } from '../../../data/jingle-api';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { LobbySettings, MultiLobby, YesNoAll } from '../../../types/jingle';
import { getCurrentUserLobby } from '../../../utils/jingle-utils';
import EnterPasswordModal from '../../EnterPasswordModal/EnterPasswordModal';
import Modal from '../../Modal';
import Navbar from '../../Navbar/Navbar';
import { Button } from '../../ui-util/Button';
import CreateLobbyModal from '../CreateLobbyModal';
import styles from './Multiplayer.module.css';

const LOBBIES_PER_PAGE = 4;

const Multiplayer = () => {
  const { currentUser } = useAuth();

  const [createLobbyModalOpen, setCreateLobbyModalOpen] = useState(false);
  const [inLobbyModalIsOpen, setInLobbyModalIsOpen] = useState(false);

  const [isCreatingLobby, setIsCreatingLobby] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { data: lobbies, mutate: mutateLobbies } = useSWR<MultiLobby[]>('/api/lobbies', getLobbies);
  const [filters, setFilters] = useState(DEFAULT_LOBBY_FILTERS);
  const [activeJoinAttempt, setActiveJoinAttempt] = useState<{
    lobbyId: string;
    modalIsOpen: boolean;
  }>({ lobbyId: '', modalIsOpen: false });
  const [enteredPassword, setEnteredPassword] = useState('');
  const [isSortedByOldest, setIsSortedByOldest] = useState(false);
  const navigate = useNavigate();

  const userCurrentLobby: MultiLobby | null = getCurrentUserLobby({
    userId: currentUser?.uid,
    lobbies,
  });
  const isMobile = useIsMobile();

  // 1. apply filters to ALL lobbies
  const filteredLobbies = useMemo(() => {
    if (!lobbies) return [];

    return lobbies.filter((lobby) => {
      if (filters.privateLobbies === YesNoAll.yes && !lobby.settings.hasPassword) return false;
      if (filters.privateLobbies === YesNoAll.no && lobby.settings.hasPassword) return false;
      return true;
    });
  }, [lobbies, filters]);

  // 2. apply sorting to FILTERED lobbies
  const sortedLobbies = useMemo(() => {
    return [...filteredLobbies].sort((a, b) =>
      isSortedByOldest
        ? new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
        : new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime(),
    );
  }, [filteredLobbies, isSortedByOldest]);

  // 3. apply pagination to SORTED lobbies
  const paginatedLobbies = useMemo(() => {
    const startIndex = (currentPage - 1) * LOBBIES_PER_PAGE;
    const endIndex = startIndex + LOBBIES_PER_PAGE;
    return sortedLobbies.slice(startIndex, endIndex);
  }, [sortedLobbies, currentPage]);

  // 4. calculate totals based on FILTERED lobbies
  const totalFilteredLobbies = filteredLobbies.length;
  const totalPages = Math.ceil(totalFilteredLobbies / LOBBIES_PER_PAGE);
  const startIndex = (currentPage - 1) * LOBBIES_PER_PAGE;
  const endIndex = Math.min(startIndex + LOBBIES_PER_PAGE, totalFilteredLobbies);

  const handleChangePrivacy = () => {
    setFilters((prev) => {
      switch (prev.privateLobbies) {
        case YesNoAll.all:
          return { ...prev, privateLobbies: YesNoAll.no };
        case YesNoAll.no:
          return { ...prev, privateLobbies: YesNoAll.yes };
        case YesNoAll.yes:
          return { ...prev, privateLobbies: YesNoAll.all };
        default:
          return prev;
      }
    });
    // reset to page 1 when filters change
    setCurrentPage(1);
  };

  const handleCreateLobby = () => {
    if (userCurrentLobby) {
      setInLobbyModalIsOpen(true);
    } else {
      setCreateLobbyModalOpen(true);
    }
  };
  const onClosePasswordModal = () => {
    setActiveJoinAttempt({
      lobbyId: '',
      modalIsOpen: false,
    });
    setEnteredPassword(''); // reset password when closing modal
  };

  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setEnteredPassword(password);
  };

  const handleSubmitPassword = async () => {
    const lobbyId = activeJoinAttempt.lobbyId;
    if (!enteredPassword || !lobbyId) {
      return;
    }
    await onJoinLobby(lobbyId);
  };

  const handleSortLobbies = () => {
    setIsSortedByOldest((prev) => !prev);
    // reset to page 1 when sorting changes
    setCurrentPage(1);
  };

  const onJoinLobby = async (lobbyId: string) => {
    if (!currentUser) {
      console.error('No user logged in');
      return;
    }

    try {
      const token = await currentUser.getIdToken();
      await joinLobby({ lobbyId, token, password: enteredPassword });
      navigate(`/multiplayer/${lobbyId}`);
    } catch (error) {
      if (error instanceof Error && 'response' in error) {
        const typedError = error as any;
        if (typedError.response?.status === 401) {
          setActiveJoinAttempt({
            lobbyId,
            modalIsOpen: true,
          });
        } else if (typedError.response?.status === 409) {
          setInLobbyModalIsOpen(true);
        }
      }
      console.error('Failed to join lobby:', error);
    }
  };

  const onCreateLobby = async ({
    lobbyName,
    lobbySettings,
    lobbyPassword,
  }: {
    lobbyName: string;
    lobbySettings: LobbySettings;
    lobbyPassword: string | undefined;
  }) => {
    if (!currentUser) {
      console.error('No user logged in');
      return;
    }

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
          password: lobbyPassword,
          token,
        });

        // OPTIMISTIC UPDATE
        mutateLobbies([...(lobbies || []), newLobby], false);
        mutateLobbies(); // re-fetch after
        setCreateLobbyModalOpen(false);
        navigate(`/multiplayer/${newLobby.id}`);
      } else {
        console.error('Lobby count exceeded! Please wait and try again later.');
      }
    } catch (error) {
      console.error('Failed to create lobby:', error);
    } finally {
      setIsCreatingLobby(false);
    }

    return null;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!lobbies || lobbies.length === 0) {
    return (
      <>
        {' '}
        <Navbar />
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
      </>
    );
  }

  return (
    <>
      <Navbar />
      <EnterPasswordModal
        open={activeJoinAttempt.modalIsOpen}
        onClose={onClosePasswordModal}
        onPasswordChange={onPasswordChange}
        password={enteredPassword}
        onSubmit={handleSubmitPassword}
      />
      <Modal
        open={inLobbyModalIsOpen}
        onClose={() => setInLobbyModalIsOpen(false)}
      >
        You're already in a different lobby{' '}
        <span style={{ fontStyle: 'italic' }}>{userCurrentLobby?.name}.</span>
      </Modal>
      <div className={styles.multiplayerContainer}>
        {createLobbyModalOpen && (
          <CreateLobbyModal
            onClose={() => setCreateLobbyModalOpen(false)}
            onCreateLobby={onCreateLobby}
          />
        )}
        <div className={`osrs-frame ${styles.multiplayerContainer}`}>
          <div className={styles.header}>
            <h1 className={styles.title}>Current Lobbies ({totalFilteredLobbies})</h1>
            <Button
              label='Create Lobby'
              disabled={(lobbies?.length ?? 0) >= MULTI_LOBBY_COUNT_LIMIT}
              onClick={() => handleCreateLobby()}
              classes='multiplayerBtn'
            />
          </div>
          <div className={styles.filters}>
            <button
              onClick={handleSortLobbies}
              className={styles.sortButton}
            >
              {isSortedByOldest ? 'Oldest' : 'Latest'}{' '}
              <FaChevronDown className={isSortedByOldest ? 'rotated' : ''} />
            </button>
            {!isMobile && (
              <Chip
                size='medium'
                color={
                  filters.privateLobbies === YesNoAll.all
                    ? 'info'
                    : filters.privateLobbies === YesNoAll.no
                      ? 'success'
                      : 'error'
                }
                onClick={handleChangePrivacy}
                label={
                  filters.privateLobbies === YesNoAll.all
                    ? 'All Lobbies'
                    : filters.privateLobbies === YesNoAll.no
                      ? 'Public Only'
                      : 'Private Only'
                }
                className={styles.chip}
              />
            )}
          </div>

          {paginatedLobbies.length > 0 ? (
            paginatedLobbies.map((lobby) => {
              const lobbyOwner = lobby.players.find((player) => player.id === lobby.ownerId);
              return (
                <div
                  className={styles.lobbyContainer}
                  onClick={() => onJoinLobby(lobby.id)}
                  key={lobby.id}
                >
                  <div className={styles.lobbyOwnerInfo}>
                    <img
                      src={lobbyOwner?.avatarUrl || DEFAULT_PFP_URL}
                      className={styles.ownerPfp}
                      alt=''
                    />
                    {lobbyOwner?.username}
                  </div>
                  <div className={styles.lobbyNameAndPlayerCount}>
                    <h2 className={styles.lobbyName}>{lobby.name}</h2>
                    <h4 className={styles.playerCount}>
                      {lobby.players?.length === 1
                        ? `${lobby.players?.length} Player`
                        : `${lobby.players?.length} Players`}
                    </h4>
                  </div>
                  {lobby.settings.hasPassword && (
                    <span className={styles.lock}>
                      <FaLock />
                    </span>
                  )}

                  {lobby.settings?.hardMode ? (
                    <Chip
                      size='medium'
                      color='error'
                      label='Hard Mode'
                      className={styles.chip}
                    />
                  ) : (
                    <Chip
                      size='medium'
                      color='success'
                      label='Standard Mode'
                      className={styles.chip}
                    />
                  )}
                  {lobby.settings?.undergroundSelected && lobby.settings?.surfaceSelected ? (
                    <Chip
                      size='medium'
                      color='info'
                      label='Underground, Surface'
                      className={styles.chip}
                    />
                  ) : lobby.settings?.undergroundSelected ? (
                    <Chip
                      size='medium'
                      color='error'
                      label='Underground'
                      className={styles.chip}
                    />
                  ) : (
                    <Chip
                      size='medium'
                      color='success'
                      label='Surface'
                      className={styles.chip}
                    />
                  )}
                  <Chip
                    size='medium'
                    color='success'
                    label={(() => {
                      const trueRegions = Object.fromEntries(
                        Object.entries(lobby.settings?.regions || {}).filter(
                          ([, value]) => value === true,
                        ),
                      );
                      const regionString = Object.keys(trueRegions).join(', ');
                      return regionString.length > 60
                        ? regionString.substring(0, 50) + '...'
                        : regionString;
                    })()}
                    className={styles.chip}
                  />
                  <h2>⏱️{lobby?.gameState?.rounds?.length} rounds</h2>
                </div>
              );
            })
          ) : (
            <h1 className={styles.noLobbiesMessage}>No lobbies match your filters!</h1>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.paginationContainer}>
              <div className={styles.paginationInfo}>
                Showing {startIndex + 1}-{endIndex} of {totalFilteredLobbies} lobbies
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
                      if (page === 1 || page === totalPages) return true;
                      if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                      return false;
                    })
                    .map((page, index, array) => {
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
