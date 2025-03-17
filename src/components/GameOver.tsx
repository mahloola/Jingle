import { sum } from "ramda";
import "../style/resultScreen.css";
import { getNextUtc4AM } from "../utils/date-utils";
import { isMobile } from "../utils/isMobile";
import NextDailyCountdown from "./NextDailyCountdown";
import { DailyChallenge, GameState } from "../types/jingle";
import {
  calculateDailyChallengePercentile,
  copyResultsToClipboard,
  getJingleNumber,
} from "../utils/jingle-utils";

interface GameOverProps {
  gameState: GameState;
  dailyChallenge: DailyChallenge;
}

export default function GameOver({ gameState, dailyChallenge }: GameOverProps) {
  const jingleNumber = getJingleNumber(dailyChallenge);
  const score = sum(gameState.scores);
  const percentile = calculateDailyChallengePercentile(dailyChallenge, score);
  return (
    <div className="result-screen-parent">
      <div className="result-screen result-screen-results">
        <div className="result-screen-title">Jingle #{jingleNumber}</div>
        <div className="result-screen-data-row">
          <div>Score</div>
          <div>{score}</div>
        </div>
        <div className="result-screen-data-row">
          <div>Time</div>
          <div>{gameState.timeTaken}</div>
        </div>
        <div className="result-screen-data-row">
          <div>Top%</div>
          <div>{percentile ? percentile.toFixed(1) + "%" : "N/A"}</div>
        </div>
        <div className="result-screen-data-row">
          <div style={{ alignContent: "center" }}>Next in</div>
          <div>
            <NextDailyCountdown end={getNextUtc4AM()} />
          </div>
        </div>
        <hr />
        <div className="result-screen-link-container">
          {!isMobile && (
            <div
              className="result-screen-option"
              onClick={() => copyResultsToClipboard(gameState)}
            >
              Copy Results
            </div>
          )}

          <a href="/" className="result-screen-option">
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
