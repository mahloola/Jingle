import useSWR from 'swr';
import { useAuth } from '../AuthContext';
import { getLobbies, getLobbyState } from '../data/jingle-api';
import { MultiGameState, MultiLobby } from '../types/jingle';
export function useLobbyState(lobbyId: string | undefined) {
  const { currentUser } = useAuth();
  const { data: lobbyState } = useSWR<MultiGameState>(
    `/api/lobbies/${lobbyId}/gameState`,
    async (): Promise<MultiGameState> => {
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
  console.log('thing');
  const { data: lobbies } = useSWR('/api/lobbies', getLobbies);
  console.log(
    'erm',
    lobbies?.find((lobby: MultiLobby) => lobby.id === lobbyId),
  );
  return lobbies?.find((lobby: MultiLobby) => lobby.id === lobbyId);
}
