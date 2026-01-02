import useSWR from 'swr';
import { getLobbies } from '../data/jingle-api';
import { MultiGameState, MultiLobby } from '../types/jingle';

export function useLobby(lobbyId: string | undefined) {
  const { data: lobbies } = useSWR('/api/lobbies', getLobbies, {
    refreshInterval: 1000, // Poll every 1 second
    revalidateOnFocus: false, // Optional: don't refetch on window focus
    dedupingInterval: 500, // Optional: prevent duplicate requests
  });
  return lobbies?.find((lobby: MultiLobby) => lobby.id === lobbyId);
}

export function confirmGuess({
  lobbyState,
  userId,
}: {
  lobbyState: MultiGameState;
  userId: string;
}) {
  const userPin = lobbyState.currentRound.pins.find((pin) => pin.userId === userId);
}
