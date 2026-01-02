import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { MultiLobby } from '../types/jingle';

const socket = io('http://localhost:8080');

export function useLobbyWebSocket(lobbyId: string | undefined) {
  const [lobby, setLobby] = useState<MultiLobby | undefined>();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    console.log('useEffect triggered, lobbyId:', lobbyId);

    if (!lobbyId) {
      console.log('No lobbyId, skipping socket connection');
    }

    socket.emit('join-lobby', lobbyId);
    console.log('Emitted join-lobby for:', lobbyId);

    const handleLobbyUpdate = (updatedLobby: MultiLobby) => {
      console.log('lobby updated', updatedLobby);
      setLobby(updatedLobby);
    };

    const handleTimerUpdate = (data: any) => {
      console.log('timer updated', data);
      if (data.lobbyId === lobbyId) {
        setTimeLeft(data.timeLeft);
      }
    };

    const handleConnect = () => {
      console.log('Socket connected');
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      console.log('Socket disconnected');
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
