import { Region, REGIONS } from '../constants/regions';

const playedSongs = new Set();
const playedSongsOrder: string[] = [];

export const getRandomSong = (regions: Region[]) => {
  const allSongs = regions.flatMap((region) => REGIONS[region]);
  const randomIndex = Math.floor(Math.random() * allSongs.length);
  return allSongs[randomIndex];
};

const updatePlayedSongs = (newSongName: string) => {
  playedSongsOrder.push(newSongName);

  // If limit is reached, remove the oldest song
  if (playedSongsOrder.length > 100) {
    //change val based on how many songs should be shown without dupes
    const oldestSong = playedSongsOrder.shift();
    playedSongs.delete(oldestSong);
  }

  playedSongs.add(newSongName);
};
