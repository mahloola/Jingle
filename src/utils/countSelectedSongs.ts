import { Region, REGIONS, UNDERGROUND_TRACKS } from '../constants/regions';
import { LobbySettings, UserPreferences } from '../types/jingle';

export const countSelectedSongs = (
  preferences: UserPreferences | LobbySettings,
  region: Region,
) => {
  const regionSongs = REGIONS[region] || [];
  const regionUndergroundSongs = UNDERGROUND_TRACKS.filter((song) => regionSongs.includes(song));
  let count = 0;
  if (preferences.undergroundSelected) {
    count += regionUndergroundSongs.length;
  }
  if (preferences.surfaceSelected) {
    count += regionSongs.length - regionUndergroundSongs.length;
  }
  return count;
};
