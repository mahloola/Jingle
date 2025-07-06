import { Region, REGIONS, UNDERGROUND_TRACKS } from '../constants/regions';
import { UserPreferences } from '../types/jingle';

export class SongService {
  private songList: string[];

  constructor(preferences: UserPreferences) {
    const enabledRegions = this.getEnabledRegions(preferences);
    let allSongs = enabledRegions.flatMap((region) => REGIONS[region]);
    allSongs = this.filterSongsByPreference(allSongs, preferences);
    this.songList = allSongs;
  }

  get songs(): string[] {
    return this.songList;
  }

  addSong = (song: string) => {
    this.songList.push(song);
  };

  getRandomSong = (preferences: UserPreferences): string => {
    if (this.songList.length === 0) {
      throw new Error('No songs available matching the current filters');
    }

    const availableSongs = this.songList.filter((song) =>
      this.songList.includes(song)
    );
    console.log(availableSongs);
    let selectedSong: string;

    if (availableSongs.length > 0) {
      selectedSong = this.selectRandomSong(availableSongs);
    } else {
      selectedSong = this.selectRandomSong(this.songList);
    }

    return selectedSong;
  };

  // Helper functions
  private getEnabledRegions = (preferences: UserPreferences): Region[] => {
    return (Object.keys(preferences.regions) as Region[]).filter(
      (region) => preferences.regions[region]
    );
  };

  private filterSongsByPreference = (
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

  private selectRandomSong = (songs: string[]): string => {
    if (songs.length === 0) {
      throw new Error('No songs available for selection');
    }
    const randomIndex = Math.floor(Math.random() * songs.length);
    return songs[randomIndex];
  };
}
