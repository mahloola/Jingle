import { Region, REGIONS, UNDERGROUND_TRACKS } from '../constants/regions';
import { UserPreferences } from '../types/jingle';

// Played songs tracking (could be moved to a separate module if needed elsewhere)
const playedSongs = new Set<string>();
const playedSongsOrder: string[] = [];

// Helper functions
const getEnabledRegions = (preferences: UserPreferences): Region[] => {
  return (Object.keys(preferences.regions) as Region[]).filter(
    (region) => preferences.regions[region]
  );
};

const getAllSongsFromRegions = (regions: Region[]): string[] => {
  return regions.flatMap((region) => REGIONS[region]);
};

const filterSongsByPreference = (
  songs: string[],
  preferences: UserPreferences
): string[] => {
  const { undergroundSelected, surfaceSelected } = preferences;

  if (undergroundSelected && !surfaceSelected) {
    return songs.filter((song) => UNDERGROUND_TRACKS.includes(song));
  }

  if (surfaceSelected && !undergroundSelected) {
    return songs.filter((song) => !UNDERGROUND_TRACKS.includes(song));
  }

  return songs;
};

const getAvailableSongs = (allSongs: string[]): string[] => {
  return allSongs.filter((song) => !playedSongs.has(song));
};

const selectRandomSong = (songs: string[]): string => {
  if (songs.length === 0) {
    throw new Error('No songs available for selection');
  }
  const randomIndex = Math.floor(Math.random() * songs.length);
  return songs[randomIndex];
};

const trackPlayedSong = (song: string): void => {
  playedSongs.add(song);
  playedSongsOrder.push(song);
};

// Main function
export const getRandomSong = (preferences: UserPreferences): string => {
  const enabledRegions = getEnabledRegions(preferences);
  let allSongs = getAllSongsFromRegions(enabledRegions);
  allSongs = filterSongsByPreference(allSongs, preferences);

  if (allSongs.length === 0) {
    throw new Error('No songs available matching the current filters');
  }

  const availableSongs = getAvailableSongs(allSongs);
  let selectedSong: string;

  if (availableSongs.length > 0) {
    selectedSong = selectRandomSong(availableSongs);
  } else {
    playedSongs.clear();
    selectedSong = selectRandomSong(allSongs);
  }

  trackPlayedSong(selectedSong);
  return selectedSong;
};
