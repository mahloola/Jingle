import { sum } from 'ramda';
import { DailyChallenge, GameState, Song } from '../types/jingle';

export const calculateDailyChallengePercentile = (
  dailyChallenge: Pick<DailyChallenge, 'results'>,
  score: number
) => {
  const sortedResults = [...dailyChallenge.results].sort((a, b) => a - b);
  const countBelowOrEqual = sortedResults.filter(
    (value) => value <= score
  ).length;

  if (sortedResults.length === 0) return 0; // Handle empty array

  const percentileOpposite = (countBelowOrEqual / sortedResults.length) * 100;
  const percentile = 100 - percentileOpposite;

  // Ensure the result is between 0 and 100
  return Math.min(100, Math.max(0, percentile));
};

export function getJingleNumber(dailyChallenge: Pick<DailyChallenge, 'date'>) {
  const dailyChallengeDate = dailyChallenge.date;
  const currentDate = new Date(dailyChallengeDate);
  const targetDate = new Date('2024-05-17');
  return (currentDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24);
}

export function copyResultsToClipboard(
  gameState: GameState,
  percentile: number
) {
  console.log(percentile);
  const score = sum(gameState.scores);
  const hardMode = gameState.settings.hardMode === true;
  const resultsString = gameState.scores
    .map((score) =>
      score === 0 ? '0 🔴' : score === 1000 ? '1000 🟢' : score + ' 🟡'
    )
    .join('\n');

  if (percentile && gameState.timeTaken) {
    navigator.clipboard.writeText(
      `I scored ${score} on today's Jingle challenge! I finished in ${
        gameState.timeTaken
      } and placed in the top ${percentile.toFixed(
        1
      )}%, can you beat me? https://jingle.rs\n\n` + resultsString
    );
    alert(`Copied results to clipboard!`);
  } else {
    navigator.clipboard.writeText(
      `I scored ${score} on today's Jingle challenge, can you beat me? https://jingle.rs\n\n` +
        resultsString
    );
    alert(`Copied results to clipboard!`);
  }
}

export function calculateSuccessRate(song: Song) {
  if (!song) return 0;

  const successRate = song.successRate ?? 0;
  const totalGuesses = song.successCount + song.failureCount;
  const successRateAverage = (
    (successRate * totalGuesses + successRate) /
    (totalGuesses + 1)
  ).toFixed(3);
  return Number(successRateAverage);
}
