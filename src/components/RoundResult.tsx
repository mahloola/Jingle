import { useEffect, useState } from 'react';
import '../style/resultMessage.css';
import { GameState, GameStatus } from '../types/jingle';
import { loadPersonalStatsFromBrowser } from '../utils/browserUtil';

interface ResultMessageProps {
  gameState: GameState;
  resultVisible: boolean;
}

export default function RoundResult({
  gameState,
  resultVisible,
}: ResultMessageProps) {
  const { currentStreak, maxStreak } = loadPersonalStatsFromBrowser();
  const [previousRecord, setPreviousRecord] = useState<number | undefined>(
    undefined,
  );
  const streakOfFive = currentStreak % 5 === 0 && currentStreak > 0;
  const justBeatPreviousRecord =
    currentStreak > 1 && currentStreak === previousRecord;

  useEffect(() => {
    const isNewRecord = currentStreak === maxStreak;
    if (isNewRecord && previousRecord === undefined) {
      // when the previous record is hit, capture it once and do not update it again
      setPreviousRecord(currentStreak);
    }
  }, [currentStreak, maxStreak, previousRecord]);

  const [guessResult, setGuessResult] = useState<number>(0);
  const [correctSong, setCorrectSong] = useState<string>(gameState.songs[0]);
  useEffect(() => {
    if (gameState.status === GameStatus.AnswerRevealed) {
      setCorrectSong(gameState.songs[gameState.round]);
      setGuessResult(gameState.scores[gameState.round]);
    }
  }, [gameState]);

  return (
    <div
      className='alert result-message'
      role='alert'
      style={{
        opacity: resultVisible ? 1 : 0,
        transition: 'opacity 500ms, margin-top 500ms ease-in-out',
        marginTop: resultVisible ? '-60px' : '0px',
        color:
          guessResult === 1000
            ? '#00FF00'
            : guessResult === 0
            ? '#FF0000'
            : '#edfd07',
      }}
    >
      +{guessResult}
      <div style={{ fontSize: '70%' }}>{correctSong}</div>
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
