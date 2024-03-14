import { toOurPixelCoordinates } from "./coordinate-utils";
import { decodeHTML } from "./string-utils";
import geojsondata from "../data/GeoJSON";
const playedSongs = new Set();
const playedSongsOrder = [];

const isFeatureVisibleOnMap = (feature) =>
  feature.geometry.coordinates.some((polygon) =>
    polygon.every((point) => {
      const [x, y] = toOurPixelCoordinates(point);
      return y > 0;
    })
  );

export const getRandomSong = () => {
  let randomSongName = "";
  const visibleFeatures = geojsondata.features.filter(isFeatureVisibleOnMap);
  do {
    const randomFeature = visibleFeatures.sort(
      () => Math.random() - Math.random()
    )[0];
    randomSongName = decodeHTML(
      randomFeature.properties.title.match(/>(.*?)</)[1]
    );
  } while (playedSongs.has(randomSongName));
  updatePlayedSongs(randomSongName);
  return randomSongName;
};

export const updatePlayedSongs = (newSongName) => {
  playedSongsOrder.push(newSongName);

  // If limit is reached, remove the oldest song
  if (playedSongsOrder.length > 100) {
    //change val based on how many songs should be shown without dupes
    const oldestSong = playedSongsOrder.shift();
    playedSongs.delete(oldestSong);
  }

  playedSongs.add(newSongName);
};
