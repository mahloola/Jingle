import { sum } from 'ramda';
import { DailyChallenge, MultiLobby, SoloGameState, Song } from '../types/jingle';

export function getJingleNumber(dailyChallenge: Pick<DailyChallenge, 'date'>) {
  const dailyChallengeDate = dailyChallenge.date;
  const currentDate = new Date(dailyChallengeDate);
  const targetDate = new Date('2024-05-17');
  return (currentDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24);
}

export function copyResultsToClipboard(
  gameState: SoloGameState,
  percentile: number | null,
  jingleNumber: number,
) {
  const score = sum(gameState.scores);
  const hardMode = gameState.settings.hardMode === true;

  let messageString = `I scored ${score} on Jingle challenge #${jingleNumber}! I finished in ${gameState.timeTaken} and `;
  if (!percentile) {
    messageString += `achieved first place! You can't beat me. https://jingle.rs\n\n`;
  } else {
    messageString += `placed in the top ${percentile.toFixed(
      1,
    )}%, can you beat me? https://jingle.rs\n\n`;
  }

  const scoresString = gameState.scores
    .map((score) => (score === 0 ? '0 🔴' : score === 1000 ? '1000 🟢' : score + ' 🟡'))
    .join('\n');

  navigator.clipboard.writeText(messageString + scoresString);
  alert(`Copied results to clipboard!`);
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

export const getCurrentUserLobby = ({ userId, lobbies }: {userId: string | undefined, lobbies: MultiLobby[] | undefined}) => {
  if (!userId || !lobbies) return null;
  for (const lobby of lobbies) {
    for (const player of lobby.players) {
      if (player.id === userId) {
        return lobby;
      }
    }
  }
  return null;
}
