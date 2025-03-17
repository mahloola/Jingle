import { GeoJsonObject } from "geojson";
import L from "leaflet";

export enum GameStatus {
  Guessing = "guessing",
  AnswerRevealed = "answer-revealed",
  GameOver = "game-over",
}

export interface GameState {
  status: GameStatus;
  round: number; // 0-4
  songs: string[];
  scores: number[];
  startTime: number;
  timeTaken: string | null;

  guessedPosition: L.LatLng | null;
  correctPolygon: GeoJsonObject | null;
}

export interface DailyChallenge {
  date: string; // YYYY-MM-DD
  songs: string[];
  submissions: number;
  results: number[];
}

export interface Statistics {
  guesses: number;
}

export interface Song {
  name: string;
  successRate: number;
  successCount: number;
  failureCount: number;
}
