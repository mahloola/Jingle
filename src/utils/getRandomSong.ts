import { Region, REGIONS, UNDERGROUND_TRACKS } from '../constants/regions';
import { UserPreferences } from '../types/jingle';

export class SongService {
  private songList: string[];

  constructor(songs: string[]) {
    this.songList = songs;
  }

  get songs(): string[] {
    return this.songList;
  }

  addSong = (song: string) => {
    this.songList.push(song);
  };

  getRandomSong = (preferences: UserPreferences): string => {
    const enabledRegions = this.getEnabledRegions(preferences);
    let allSongs = enabledRegions.flatMap((region) => REGIONS[region]);
    allSongs = this.filterSongsByPreference(allSongs, preferences);

    if (allSongs.length === 0) {
      throw new Error('No songs available matching the current filters');
    }

    const availableSongs = allSongs.filter(
      (song) => !this.songList.includes(song)
    );
    console.log(availableSongs);
    let selectedSong: string;

    if (availableSongs.length > 0) {
      selectedSong = this.selectRandomSong(availableSongs);
    } else {
      selectedSong = this.selectRandomSong(allSongs);
    }

    return selectedSong;
  };

  // Helper functions
  getEnabledRegions = (preferences: UserPreferences): Region[] => {
    return (Object.keys(preferences.regions) as Region[]).filter(
      (region) => preferences.regions[region]
    );
  };

  filterSongsByPreference = (
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

  selectRandomSong = (songs: string[]): string => {
    if (songs.length === 0) {
      throw new Error('No songs available for selection');
    }
    const randomIndex = Math.floor(Math.random() * songs.length);
    return songs[randomIndex];
  };
}
