import { useEffect, useState } from 'react';
import '../style/resultMessage.css';
import { GameStatus, SoloGameState } from '../types/jingle';
import { loadPersonalStatsFromBrowser } from '../utils/browserUtil';

interface ResultMessageProps {
  gameState: SoloGameState;
}

export default function RoundResult({ gameState }: ResultMessageProps) {
  const { currentStreak, maxStreak } = loadPersonalStatsFromBrowser();
  const [previousRecord, setPreviousRecord] = useState<number | undefined>(undefined);
  const streakOfFive = currentStreak % 5 === 0 && currentStreak > 0;
  const justBeatPreviousRecord = currentStreak > 1 && currentStreak === previousRecord;

  useEffect(() => {
    const isNewRecord = currentStreak === maxStreak;
    if (isNewRecord && previousRecord === undefined) {
      // when the previous record is hit, capture it once and do not update it again
      setPreviousRecord(currentStreak);
    }
  }, [currentStreak, maxStreak, previousRecord]);

  // capture values to display on positive edge
  const [score, setScore] = useState<number>(0);
  const [song, setSong] = useState<string>(gameState.songs[0]);
  useEffect(() => {
    if (gameState.status === GameStatus.AnswerRevealed) {
      setSong(gameState.songs[gameState.round]);
      setScore(gameState.scores[gameState.round]);
    }
  }, [gameState]);

  const show = gameState.status === GameStatus.AnswerRevealed;
  return (
    <div
      className='alert result-message'
      role='alert'
      style={{
        opacity: show ? 1 : 0,
        transition: 'opacity 500ms, margin-top 500ms ease-in-out',
        marginTop: show ? '-60px' : '0px',
        color:
          score === 1000
            ? 'var(--primary-green)'
            : score === 0
            ? 'var(--primary-red)'
            : 'var(--primary-yellow)',
      }}
    >
      +{score}
      <div style={{ fontSize: '70%' }}>{song}</div>
      {(streakOfFive || justBeatPreviousRecord) && (
        <div
          className='streak'
          key={`streak-${currentStreak}`}
        >
          {currentStreak} streak 🔥
          {justBeatPreviousRecord && (
            <>
              <br />
              New record! 🎉
            </>
          )}
        </div>
      )}
    </div>
  );
}
