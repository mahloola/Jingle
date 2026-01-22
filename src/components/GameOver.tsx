import { sum } from 'ramda';
import '../style/resultScreen.css';
import { DailyChallenge, SoloGameState } from '../types/jingle';
import { getNextUkMidnight } from '../utils/date-utils';
import { isMobile } from '../utils/isMobile';
import { copyResultsToClipboard, getJingleNumber } from '../utils/jingle-utils';
import NextDailyCountdown from './NextDailyCountdown';

interface GameOverProps {
  gameState: SoloGameState;
  dailyChallenge: DailyChallenge;
  percentile: number | null;
}

export default function GameOver({ gameState, dailyChallenge, percentile }: GameOverProps) {
  const jingleNumber = getJingleNumber(dailyChallenge);
  const score = sum(gameState.scores);
  const percentileSanitized = percentile === null ? 'N/A' : percentile === 0 ? 'First Place' : percentile.toFixed(1) + '%';
  return (
    <div className='result-screen-parent'>
      <div className='result-screen result-screen-results'>
        <div className='result-screen-title'>Jingle #{jingleNumber}</div>
        <div className='result-screen-data-row'>
          <div>Score</div>
          <div>{score}</div>
        </div>
        <div className='result-screen-data-row'>
          <div>Time Taken</div>
          <div>{gameState.timeTaken}</div>
        </div>
        <div className='result-screen-data-row'>
          <div>Top%</div>
          <div>{percentileSanitized}</div>
        </div>
        <div className='result-screen-data-row'>
          <div style={{ alignContent: 'center' }}>Next in</div>
          <div>
            <NextDailyCountdown end={getNextUkMidnight()} />
          </div>
        </div>
        <hr />
        <div className='result-screen-link-container'>
          {!isMobile && (
            <div
              className='result-screen-option'
              onClick={() => copyResultsToClipboard(gameState, percentile, jingleNumber)}
            >
              Copy Results
            </div>
          )}

          <a
            href='/'
            className='result-screen-option'
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
