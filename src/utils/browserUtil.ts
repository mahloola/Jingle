import { LOCAL_STORAGE } from '../constants/localStorage';
import { GameState, UserPreferences } from '../types/jingle';

export const saveGameStateToBrowser = (
  jingleNumber: number,
  gameState: GameState,
) => {
  localStorage.setItem(
    LOCAL_STORAGE.gameState(jingleNumber),
    JSON.stringify(gameState),
  );
};

export const savePreferencesToBrowser = (preferences: UserPreferences) => {
  localStorage.setItem(LOCAL_STORAGE.preferences, JSON.stringify(preferences));
};

export const loadGameStateFromBrowser = (
  jingleNumber: number,
): GameState | null => {
  const gameStateJson = localStorage.getItem(
    LOCAL_STORAGE.gameState(jingleNumber),
  );
  try {
    const gameState = JSON.parse(gameStateJson ?? 'null');
    return gameState;
  } catch (e) {
    console.error(
      'Failed to parse saved game state for Jingle #' + jingleNumber,
    );
    return null;
  }
};

export const loadPreferencesFromBrowser = () => {
  const preferencesJson =
    localStorage.getItem(LOCAL_STORAGE.preferences) ?? null;
  try {
    const preferences: UserPreferences = preferencesJson
      ? JSON.parse(preferencesJson)
      : null;
    return preferences;
  } catch (e) {
    console.error('Failed to parse saved settings.');
    return null;
  }
};

export const incrementLocalGuessCount = (correct: boolean) => {
  const key = correct
    ? LOCAL_STORAGE.correctGuessCount
    : LOCAL_STORAGE.incorrectGuessCount;
  const currentCount = parseInt(localStorage.getItem(key) ?? '0');
  localStorage.setItem(key, (currentCount + 1).toString());
};

export const updateGuessStreak = (success: boolean) => {
  const streak = parseInt(
    localStorage.getItem(LOCAL_STORAGE.currentStreak) ?? '0',
  );
  let maxStreak;
  if (LOCAL_STORAGE.maxStreak === undefined) {
    maxStreak = 0;
  } else {
    maxStreak = parseInt(LOCAL_STORAGE.maxStreak) ?? 0;
  }
  if (success) {
    localStorage.setItem(LOCAL_STORAGE.currentStreak, (streak + 1).toString());
    console.log(
      'updating current streak',
      parseInt(LOCAL_STORAGE.maxStreak) ?? 0,
      streak,
    );
    if (streak > parseInt(LOCAL_STORAGE.maxStreak ?? '0')) {
      console.log('updating max streak', streak + 1);
      localStorage.setItem(LOCAL_STORAGE.maxStreak, (streak + 1).toString());
    }
  } else {
    localStorage.setItem(LOCAL_STORAGE.currentStreak, '0');
  }
};

export const loadPersonalStatsFromBrowser = () => {
  const correctGuessCount = parseInt(
    localStorage.getItem(LOCAL_STORAGE.correctGuessCount) ?? '0',
  );
  const incorrectGuessCount = parseInt(
    localStorage.getItem(LOCAL_STORAGE.incorrectGuessCount) ?? '0',
  );
  const currentStreak = parseInt(
    localStorage.getItem(LOCAL_STORAGE.currentStreak) ?? '0',
  );
  const maxStreak = parseInt(
    localStorage.getItem(LOCAL_STORAGE.maxStreak) ?? '0',
  );
  return {
    correctGuessCount,
    incorrectGuessCount,
    maxStreak,
    currentStreak,
  };
};
