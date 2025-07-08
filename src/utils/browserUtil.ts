import { DEFAULT_GAME_STATE, DEFAULT_PREFERENCES } from '../constants/defaults';
import { LOCAL_STORAGE } from '../constants/localStorage';
import { DailyChallenge, GameState, isValidGameState, UserPreferences } from '../types/jingle';

export const saveGameStateToBrowser = (jingleNumber: number, gameState: GameState) => {
  localStorage.setItem(LOCAL_STORAGE.gameState(jingleNumber), JSON.stringify(gameState));
};

export const savePreferencesToBrowser = (preferences: UserPreferences) => {
  localStorage.setItem(LOCAL_STORAGE.preferences, JSON.stringify(preferences));
};

export const loadSeenAnnouncementIdFromBrowser = () => {
  const seenAnnouncementId: string | null =
    localStorage.getItem(LOCAL_STORAGE.seenAnnouncementId) ?? null;
  return seenAnnouncementId;
};

export const setSeenAnnouncementIdToBrowser = (id: string) => {
  localStorage.setItem(LOCAL_STORAGE.seenAnnouncementId, id.toString());
};

export const loadGameStateFromBrowser = (
  jingleNumber: number,
  dailyChallenge: DailyChallenge,
): GameState => {
  const browserGameState = JSON.parse(
    localStorage.getItem(LOCAL_STORAGE.gameState(jingleNumber)) ?? '',
  );

  const defaultState = DEFAULT_GAME_STATE;
  defaultState.songs = dailyChallenge.songs;

  const gameState = {
    ...defaultState,
    ...browserGameState,
  }; // fill any non-existing fields with the defaults

  try {
    if (!isValidGameState(gameState)) {
      console.warn(
        'Saved game state for Jingle #' + jingleNumber + ' is invalid, using a default game state.',
        gameState,
      );
      return defaultState;
    }
    return gameState;
  } catch (e) {
    console.warn(
      'Failed to parse saved game state for Jingle #' +
        jingleNumber +
        ', using a default game state.',
    );
    return defaultState;
  }
};

export const loadPreferencesFromBrowser = (): UserPreferences => {
  const preferencesJson = localStorage.getItem(LOCAL_STORAGE.preferences);
  try {
    const preferences: UserPreferences = preferencesJson
      ? JSON.parse(preferencesJson)
      : DEFAULT_PREFERENCES;
    return preferences;
  } catch (e) {
    console.error('Failed to parse saved settings, returning default settings.');
    return DEFAULT_PREFERENCES;
  }
};

export const incrementLocalGuessCount = (correct: boolean) => {
  const key = correct ? LOCAL_STORAGE.correctGuessCount : LOCAL_STORAGE.incorrectGuessCount;
  const currentCount = parseInt(localStorage.getItem(key) ?? '0');
  localStorage.setItem(key, (currentCount + 1).toString());
};

export const updateGuessStreak = (success: boolean) => {
  let currentStreak = parseInt(localStorage.getItem(LOCAL_STORAGE.currentStreak) ?? '0');
  let maxStreak = parseInt(localStorage.getItem(LOCAL_STORAGE.maxStreak) ?? '0');

  if (success) {
    currentStreak += 1;
    maxStreak = Math.max(currentStreak, maxStreak);
  } else {
    currentStreak = 0;
  }
  localStorage.setItem(LOCAL_STORAGE.currentStreak, currentStreak.toString());
  localStorage.setItem(LOCAL_STORAGE.maxStreak, maxStreak.toString());
};

export const loadPersonalStatsFromBrowser = () => {
  const correctGuessCount = parseInt(localStorage.getItem(LOCAL_STORAGE.correctGuessCount) ?? '0');
  const incorrectGuessCount = parseInt(
    localStorage.getItem(LOCAL_STORAGE.incorrectGuessCount) ?? '0',
  );
  const currentStreak = parseInt(localStorage.getItem(LOCAL_STORAGE.currentStreak) ?? '0');
  const maxStreak = parseInt(localStorage.getItem(LOCAL_STORAGE.maxStreak) ?? '0');
  return {
    correctGuessCount,
    incorrectGuessCount,
    maxStreak,
    currentStreak,
  };
};
