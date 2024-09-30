import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:8080');

const Matchmaking = () => {
  const [matchFound, setMatchFound] = useState(false);
  const [opponentId, setOpponentId] = useState(null);

  useEffect(() => {
    socket.on('matchFound', (data) => {
      setMatchFound(true);
      setOpponentId(data.opponentId);
    });

    return () => {
      socket.off('matchFound');
    };
  }, [matchFound]);

  const findMatch = () => {
    socket.emit('findMatch');
  };

  return (
    <div>
      {matchFound ? (
        <div>Match found! Opponent ID: {opponentId}</div>
      ) : (
        <button onClick={findMatch}>Find Match</button>
      )}
    </div>
  );
};

export default Matchmaking;
