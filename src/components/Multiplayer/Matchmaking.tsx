import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const Matchmaking = () => {
  const [matchFound, setMatchFound] = useState(false);
  const [opponentId, setOpponentId] = useState(null);
  const socket = io('http://localhost:8080');
  useEffect(() => {
    console.log('Socket connection status:', socket.connected);
    console.log('Socket ID:', socket.id);
    socket.on('matchFound', (data) => {
      setMatchFound(true);
      setOpponentId(data.opponentId);
    });

    return () => {
      socket.off('matchFound');
    };
  }, [matchFound]);

  const findMatch = () => {
    console.log('ahh');
    socket.emit('chat message', 'hELLO');
  };

  return (
    <div>
      {matchFound ? (
        <div>Match found! Opponent ID: {opponentId}</div>
      ) : (
        <button onClick={findMatch}>Test Socket</button>
      )}
    </div>
  );
};

export default Matchmaking;
