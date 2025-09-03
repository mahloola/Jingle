import { sum } from 'ramda';
import '../style/resultScreen.css';
import { DailyChallenge, GameState } from '../types/jingle';
import { getNextUkMidnight } from '../utils/date-utils';
import { isMobile } from '../utils/isMobile';
import {
  calculateDailyChallengePercentile,
  copyResultsToClipboard,
  getJingleNumber,
} from '../utils/jingle-utils';
import NextDailyCountdown from './NextDailyCountdown';

interface GameOverProps {
  gameState: GameState;
  dailyChallenge: DailyChallenge;
}

export default function GameOver({ gameState, dailyChallenge }: GameOverProps) {
  const jingleNumber = getJingleNumber(dailyChallenge);
  const score = sum(gameState.scores);
  const percentile: number = calculateDailyChallengePercentile(dailyChallenge, score);
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
          <div>{percentile !== 0 ? percentile.toFixed(1) + '%' : 'First Place'}</div>
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
