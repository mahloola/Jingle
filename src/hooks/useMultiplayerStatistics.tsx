import { useEffect, useRef } from 'react';
import {
  incrementGlobalGuessCounter,
  incrementSongFailureCount,
  incrementSongSuccessCount,
} from '../data/jingle-api';
import { MultiGameState, MultiLobbyStatus } from '../types/jingle';
import { incrementLocalGuessCount, updateGuessStreak } from '../utils/browserUtil';

const updateStatistics = (song: string, correct: boolean) => {
  incrementGlobalGuessCounter();
  // const currentSong = gameState.songs[gameState.round];
  // const correct = gameState.scores[gameState.round] === 1000;
  if (correct) {
    incrementSongSuccessCount(song);
    incrementLocalGuessCount(true);
    updateGuessStreak(true);
  } else {
    incrementSongFailureCount(song);
    incrementLocalGuessCount(false);
    updateGuessStreak(false);
  }
};

export function useMultiplayerStatistics(
  lobbyState: MultiGameState | undefined,
  currentUserId: string | undefined,
) {
  const prevStatusRef = useRef<MultiLobbyStatus | undefined>(null);

  useEffect(() => {
    if (!lobbyState?.status || !lobbyState.currentRound?.songName || !currentUserId) return;

    const wasPlaying = prevStatusRef.current === MultiLobbyStatus.Playing;
    const isRevealing = lobbyState.status === MultiLobbyStatus.Revealing;

    if (wasPlaying && isRevealing) {
      const songName = lobbyState.currentRound.songName;
      const userResult = lobbyState.currentRound.results?.find(
        (result) => result.userId === currentUserId,
      );
      const isCorrect = (userResult?.score ?? 0) > 0;

      updateStatistics(songName, isCorrect);
    }

    prevStatusRef.current = lobbyState.status;
  }, [lobbyState?.status, lobbyState?.currentRound, currentUserId]);
}
