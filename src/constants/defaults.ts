import { GameStatus, LobbySettings, SoloGameState, UserPreferences } from '../types/jingle';

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
export const DEFAULT_LOBBY_SETTINGS: LobbySettings = {
  password: null,
  roundTimeSeconds: 30,
  roundIntervalSeconds: 5,
  hardMode: DEFAULT_PREFERENCES.preferHardMode,
  hardModeLength: DEFAULT_PREFERENCES.hardModeLength,
  regions: DEFAULT_PREFERENCES.regions,
  undergroundSelected: DEFAULT_PREFERENCES.undergroundSelected,
  surfaceSelected: DEFAULT_PREFERENCES.surfaceSelected,
};
// IF USING THIS, PROVIDE SONGS[] AFTER YOU CREATE A DEFAULT OBJECT
export const DEFAULT_GAME_STATE: SoloGameState = {
  settings: { hardMode: false, oldAudio: false },
  status: GameStatus.Guessing,
  round: 0, // 0-4
  songs: [],
  scores: [],
  startTimeMs: Date.now(),
  timeTaken: '',
  clickedPosition: null,
  navigationStack: [],
};

export const MULTI_LOBBY_COUNT_LIMIT = 100;
