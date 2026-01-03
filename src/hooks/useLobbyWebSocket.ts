import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { MultiLobby } from '../types/jingle';

const apiHost = import.meta.env.VITE_API_HOST;
const socket = io(apiHost);

export function useLobbyWebSocket(lobbyId: string | undefined) {
  const [lobby, setLobby] = useState<MultiLobby | undefined>();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    if (!lobbyId) {
      console.error('No lobbyId, skipping socket connection');
    }

    socket.emit('join-lobby', lobbyId);

    const handleLobbyUpdate = (updatedLobby: MultiLobby) => {
      setLobby(updatedLobby);
    };

    const handleTimerUpdate = (data: any) => {
      if (data.lobbyId === lobbyId) {
        setTimeLeft(data.timeLeft);
      }
    };

    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    // set up all listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('lobby-update', handleLobbyUpdate);
    socket.on('timer-update', handleTimerUpdate);

    // cleanup on unmount or when lobbyId changes
    return () => {
      console.log('Cleaning up socket for lobby:', lobbyId);
      socket.emit('leave-lobby', lobbyId);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('lobby-update', handleLobbyUpdate);
      socket.off('timer-update', handleTimerUpdate);
    };
  }, [lobbyId]);

  return { lobby, timeLeft, socket, isConnected };
}
