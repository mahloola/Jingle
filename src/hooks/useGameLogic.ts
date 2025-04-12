import { RefObject, useState } from 'react';
import {
  DailyChallenge,
  GameSettings,
  GameState,
  GameStatus,
} from '../types/jingle';
import { calculateTimeDifference } from '../utils/date-utils';
import { clone } from 'ramda';
import L from 'leaflet';
import { findNearestPolygonWhereSongPlays } from '../utils/map-utils';

export default function useGameLogic(
  mapRef: RefObject<L.Map | null>,
  initialGameState: GameState,
) {
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  const setClickedPosition = (leaflet_ll_click: L.LatLng): GameState => {
    const newGameState = { ...gameState, leaflet_ll_click };
    setGameState(newGameState);
    return newGameState;
  };

  // latestGameState is required when called immediately after setGuess
  const confirmGuess = (latestGameState?: GameState): GameState => {
    const newGameState = latestGameState ?? gameState;
    if (newGameState.leaflet_ll_click === null) {
      throw new Error('leaflet_ll_click cannot be null');
    }

    const song = newGameState.songs[newGameState.round];
    const { distance } = findNearestPolygonWhereSongPlays(
      mapRef.current!,
      song,
      newGameState.leaflet_ll_click,
    );
    const correct = distance === 0;
    const score = Math.round(
      correct ? 1000 : (1000 * 1) / Math.exp(0.0018 * distance),
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

  // latestGameState is required when called immediately after addSong
  const nextSong = (latestGameState?: GameState): GameState => {
    const prev = latestGameState ?? gameState;
    const newGameState = {
      ...prev,
      round: prev.round + 1,
      status: GameStatus.Guessing,
      leaflet_ll_click: null,
    };
    setGameState(newGameState);
    return newGameState;
  };

  // PRACTICE MODE ONLY
  const addSong = (song: string): GameState => {
    const newGameState = {
      ...gameState,
      songs: [...gameState.songs, song],
    };
    setGameState(newGameState);
    return newGameState;
  };

  /// DAILY JINGLE MODE ONLY
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
    setClickedPosition,
    confirmGuess,
    addSong,
    nextSong,
    endGame,
    updateGameSettings,
  };
}
