import useSWR from 'swr';
import { useAuth } from '../AuthContext';
import { getLobbies, getLobbyState } from '../data/jingle-api';
import { MultiGameState, MultiLobby } from '../types/jingle';

export function useLobbyState(lobbyId: string | undefined) {
  const { currentUser } = useAuth();

  const { data: lobbyState } = useSWR<MultiGameState>(
    `/api/lobbies/${lobbyId}/gameState`,
    async (): Promise<MultiGameState> => {
      console.log('getting lobby state');
      if (!currentUser) throw new Error('No user');
      if (!lobbyId) throw new Error('No lobby ID');
      const token = await currentUser.getIdToken();
      const lobbyState = await getLobbyState({ lobbyId, token });
      if (!lobbyState) throw Error("Couldn't load lobby state.");
      return lobbyState;
    },
  );
  return lobbyState;
}

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
