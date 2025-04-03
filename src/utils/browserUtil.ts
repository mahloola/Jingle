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
    ? LOCAL_STORAGE.correctGuesses
    : LOCAL_STORAGE.incorrectGuesses;
  const currentCount = parseInt(localStorage.getItem(key) ?? '0');
  localStorage.setItem(key, (currentCount + 1).toString());
};
