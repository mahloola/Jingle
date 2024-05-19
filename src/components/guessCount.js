import { useEffect, useState } from 'react';
import { getStatistics } from '../db/db';

// Import your getGuessCount function here

const GuessCount = () => {
  const [guessCount, setGuessCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(async () => {
      const statistics = await getStatistics();
      const formattedCount = statistics.guesses.toLocaleString();
      setGuessCount(formattedCount);
    }, 2000);

    // Clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, []); // Empty dependency array ensures useEffect runs only once on mount

  return guessCount;
};

export default GuessCount;
