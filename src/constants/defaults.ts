import { GameState, GameStatus, UserPreferences } from '../types/jingle';

export const MAX_MIN_HISTORY_COLORS: [number, number] = [4500, 0]; // completely arbitrary, imo 5000 would show too much red and discourage people
export const CENTER_COORDINATES: [number, number] = [3222, 3218];
export const DEFAULT_PREFERENCES: UserPreferences = {
  preferHardMode: false,
  preferOldAudio: false,
  preferConfirmation: true,
  regions: {
    Misthalin: true,
    Karamja: true,
    Asgarnia: true,
    Fremennik: true,
    Kandarin: true,
    Desert: true,
    Morytania: true,
    Tirannwn: true,
    Wilderness: true,
    Kourend: true,
    Varlamore: true,
  },
  hardModeLength: 2,
  undergroundSelected: true,
  surfaceSelected: true,
};

// IF USING THIS, PROVIDE SONGS[] AFTER YOU CREATE A DEFAULT OBJECT
export const DEFAULT_GAME_STATE: GameState = {
  settings: { hardMode: false, oldAudio: false },
  status: GameStatus.Guessing,
  round: 0, // 0-4
  songs: [],
  scores: [],
  startTime: Date.now(),
  timeTaken: '',
  clickedPosition: null,
  navigationStack: [],
};
