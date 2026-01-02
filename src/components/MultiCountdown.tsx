import React, { useEffect, useRef, useState } from 'react';

interface CountdownTimerProps {
  targetDate: Date;
  onComplete?: () => void;
}

export const MultiCountdown: React.FC<CountdownTimerProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const intervalRef = useRef<number | null>(null); // Use number for browser
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const targetTime = targetDate.getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft('00:00');
        if (intervalRef.current) window.clearInterval(intervalRef.current);
        return;
      }

      const totalSeconds = Math.floor(difference / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateCountdown();

    // Store interval ID (returns number in browser)
    intervalRef.current = window.setInterval(updateCountdown, 1000);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [targetDate]);

  return <span>{timeLeft}</span>;
};
