import React, { useState, useEffect } from "react";
import { getStatistics } from "../db/db";
import { Spinner } from "react-bootstrap";

// Import your getGuessCount function here

const GuessCountComponent = () => {
  const [guessCount, setGuessCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(async () => {
      const statistics = await getStatistics();
      const formattedCount = (statistics.guesses).toLocaleString();
      setGuessCount(formattedCount);
    }, 2000);

    // Clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, []); // Empty dependency array ensures useEffect runs only once on mount

  return guessCount;
}

export default GuessCountComponent;
