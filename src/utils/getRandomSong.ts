import { Region, REGIONS, UNDERGROUND_TRACKS } from '../constants/regions';
import { UserPreferences } from '../types/jingle';

export class SongService {
  private songList: string[];

  constructor(preferences: UserPreferences) {
    this.songList = this.getAvailableSongs(preferences);
  }

  get songs(): string[] {
    return this.songList;
  }

  removeSong = (songToRemove: string) => {
    this.songList = this.songList.filter((song) => song !== songToRemove);
  };

  addSong = (song: string) => {
    this.songList.push(song);
  };

  getAvailableSongs = (preferences: UserPreferences): string[] => {
    const enabledRegions = this.getEnabledRegions(preferences);
    let allSongs = enabledRegions.flatMap((region) => REGIONS[region]);
    allSongs = this.filterSongsByPreference(allSongs, preferences);
    return allSongs;
  };

  getRandomSong = (preferences: UserPreferences): string => {
    const availableSongs = this.songList.filter((song) => this.songList.includes(song));
    if (availableSongs.length === 0) {
      this.songList = this.getAvailableSongs(preferences);
    }
    const selectedSong = this.selectRandomSong(availableSongs);

    return selectedSong;
  };

  // Helper functions
  private getEnabledRegions = (preferences: UserPreferences): Region[] => {
    return (Object.keys(preferences.regions) as Region[]).filter(
      (region) => preferences.regions[region],
    );
  };

  private filterSongsByPreference = (songs: string[], preferences: UserPreferences): string[] => {
    const { undergroundSelected, surfaceSelected } = preferences;

    if (undergroundSelected && !surfaceSelected) {
      return songs.filter((song) => UNDERGROUND_TRACKS.includes(song));
    }

    if (surfaceSelected && !undergroundSelected) {
      return songs.filter((song) => !UNDERGROUND_TRACKS.includes(song));
    }

    return songs;
  };

  private selectRandomSong = (songs: string[]): string => {
    if (songs.length === 0) {
      throw new Error('No songs available for selection');
    }
    const randomIndex = Math.floor(Math.random() * songs.length);
    return songs[randomIndex];
  };
}
