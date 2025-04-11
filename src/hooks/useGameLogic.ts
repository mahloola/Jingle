import { GeoJsonObject } from 'geojson';
import { LatLng } from 'leaflet';
import { useState } from 'react';
import {
  DailyChallenge,
  GameSettings,
  GameState,
  GameStatus,
} from '../types/jingle';
import { calculateTimeDifference } from '../utils/date-utils';
import { clone } from 'ramda';

export interface Guess {
  correct: boolean;
  distance: number;
  guessedPosition: LatLng;
  correctPolygon: GeoJsonObject;
}

export default function useGameLogic(
  dailyChallenge: DailyChallenge,
  initialGameState?: GameState | null,
) {
  const [gameState, setGameState] = useState<GameState>(
    initialGameState ?? {
      status: GameStatus.Guessing,
      settings: {
        hardMode: false, // or whatever default value you want
        oldAudio: false,
      },
      round: 0,
      songs: dailyChallenge.songs,
      scores: [],
      startTime: Date.now(),
      timeTaken: null,
      guess: null,
    },
  );

  const setGuess = (guess: Guess): GameState => {
    const newGameState = { ...gameState, guess };
    setGameState(newGameState);
    return newGameState;
  };

  // latestGameState is required if called immediately after setGuess
  const confirmGuess = (latestGameState?: GameState): GameState => {
    const newGameState = latestGameState ?? gameState;
    if (newGameState.guess === null) {
      throw new Error('guess cannot be null');
    }

    const score = Math.round(
      newGameState.guess.correct
        ? 1000
        : (1000 * 1) / Math.exp(0.0018 * newGameState.guess.distance),
    );
    newGameState.status = GameStatus.AnswerRevealed;
    newGameState.scores.push(score);
    setGameState(clone(newGameState));

    const isLastRound = newGameState.round === newGameState.songs.length - 1;
    if (isLastRound) {
      newGameState.timeTaken = calculateTimeDifference(
        newGameState.startTime,
        Date.now(),
      );
      setGameState(clone(newGameState));
    }

    return newGameState;
  };

  const nextSong = (): GameState => {
    const newGameState = {
      ...gameState,
      round: gameState.round + 1,
      status: GameStatus.Guessing,
      guess: null,
    };
    setGameState(newGameState);
    return newGameState;
  };

  const endGame = (): GameState => {
    const newGameState = { ...gameState, status: GameStatus.GameOver };
    setGameState(newGameState);
    return newGameState;
  };

  const updateGameSettings = (newSettings: GameSettings) => {
    setGameState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...newSettings,
      },
    }));
  };

  return {
    gameState,
    setGuess,
    confirmGuess,
    nextSong,
    endGame,
    updateGameSettings,
  };
}
