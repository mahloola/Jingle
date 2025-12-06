import { RefObject } from 'react';
import { Region, REGIONS, UNDERGROUND_TRACKS } from '../constants/regions';
import { UserPreferences } from '../types/jingle';
import { loadPreferencesFromBrowser } from './browserUtil';

export class SongService {
  private static instance: SongService;
  private songList: string[];
  private snippet: [number, number] | null;

  private constructor(preferences: UserPreferences) {
    this.songList = this.getAvailableSongs(preferences);
    this.snippet = null;
  }

  static Instance(): SongService {
    if (!SongService.instance) {
      const initialPreferences = loadPreferencesFromBrowser();
      SongService.instance = new SongService(initialPreferences);
    }
    return SongService.instance;
  }

  regenerateSongs(preferences: UserPreferences) {
    this.songList = this.getAvailableSongs(preferences);
  }

  get songs(): string[] {
    return this.songList;
  }

  getSnippet = (audioRef: RefObject<HTMLAudioElement | null>, length: number) => {
    if (!this.snippet) {
      this.generateSnippet(audioRef, length);
    }
    return this.snippet;
  };

  resetSnippet = () => {
    this.snippet = null;
  };

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
    return "Barren Land"
    return selectedSong;
  };

  // Helper functionsThe
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

  private generateSnippet = (audioRef: RefObject<HTMLAudioElement | null>, length: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const generate = () => {
      const songDuration = audio.duration;
      const buffer = 10;

      if (songDuration <= 2 * buffer + length) {
        console.warn('Song too short for buffered snippet.');
        this.snippet = [0, length];
        return;
      }

      const maxStart = songDuration - buffer - length;
      const minStart = buffer;
      const start = Math.random() * (maxStart - minStart) + minStart;
      const end = start + length;
      this.snippet = [start, end];
    };

    if (audio.readyState >= 1) {
      // Metadata is already loaded
      generate();
    } else {
      // Wait for metadata
      const onLoadedMetadata = () => {
        audio.removeEventListener('loadedmetadata', onLoadedMetadata);
        generate();
      };
      audio.addEventListener('loadedmetadata', onLoadedMetadata);
    }
  };
}
