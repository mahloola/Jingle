import React, { useEffect, useState } from 'react';

const CountdownToFourAMUTC = () => {
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const utcNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000);

      // Calculate the next 04:00 UTC
      let nextFourAMUTC = new Date(
        Date.UTC(
          utcNow.getUTCFullYear(),
          utcNow.getUTCMonth(),
          utcNow.getUTCDate(),
          3,
          0,
          0,
        ),
      );

      // If the current time is past 04:00 UTC, set the target to the next day
      if (utcNow >= nextFourAMUTC) {
        nextFourAMUTC = new Date(
          Date.UTC(
            utcNow.getUTCFullYear(),
            utcNow.getUTCMonth(),
            utcNow.getUTCDate() + 1,
            3,
            0,
            0,
          ),
        );
      }

      const timeLeft = nextFourAMUTC - utcNow;

      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      const timeString = `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      setCountdown(timeString);
    };

    const interval = setInterval(calculateTimeLeft, 1000);

    // Initial call to set the countdown immediately
    calculateTimeLeft();

    return () => clearInterval(interval);
  }, []);

  return <div>{countdown}</div>;
};

export default CountdownToFourAMUTC;
