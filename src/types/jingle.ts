import L from 'leaflet';
import { Region } from '../constants/regions';
import { Position } from 'geojson';

export enum Screen {
  MainMenu = 'main-menu',
  DailyJingle = 'daily-jingle',
  Practice = 'practice',
}

export enum GameStatus {
  Guessing = 'guessing',
  AnswerRevealed = 'answer-revealed',
  GameOver = 'game-over',
}

export enum ModalType {
  Stats = 'stats',
  News = 'news',
  Settings = 'settings',
}
export interface GameState {
  settings: GameSettings;
  status: GameStatus;
  round: number; // 0-4
  songs: string[];
  scores: number[];
  startTime: number;
  timeTaken: string | null;

  clickedPosition: ClickedPosition | null;
}
export interface ClickedPosition {
  xy: Position;
  mapId: number;
}

// if we make changes to GameState schema, we can invalidate the old game state saved in user's local storage to prevent crashes
export const isValidGameState = (object: unknown): object is GameState => {
  if (!object) return false;
  if (typeof (object as any).status !== 'string') return false;
  if (typeof (object as any).round !== 'number') return false;
  if (!Array.isArray((object as any).songs)) return false;
  if (!Array.isArray((object as any).scores)) return false;
  if ('guess' in (object as any)) return false;
  if (
    (object as any).status === GameStatus.AnswerRevealed &&
    !('clickedPosition' in (object as any))
  )
    return false;
  if ('clickedPosition' in (object as any)) {
    const isNull = (object as any).clickedPosition === null;
    const xyDefined = (object as any).clickedPosition?.xy !== undefined;
    const mapIdDefined = (object as any).clickedPosition?.mapId !== undefined;
    return isNull || (xyDefined && mapIdDefined);
  }
  return true;
};

export interface GameSettings {
  hardMode: boolean;
  oldAudio: boolean;
}

export interface PersonalStats {
  correctGuesses: number;
  incorrectGuesses: number;
  maxStreak: number;
  currentStreak: number;
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

export interface UserPreferences {
  preferHardMode: boolean;
  preferOldAudio: boolean;
  preferConfirmation: boolean;
  regions: Record<Region, boolean>;
}

export interface Song {
  name: string;
  successRate: number;
  successCount: number;
  failureCount: number;
}
