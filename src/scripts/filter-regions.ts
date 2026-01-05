import geojsondata from '../data/GeoJSON.ts';
import { sanitizeSongName } from '../utils/sanitizeSongName.ts';

const borders = {
  zeah: [
    [2880, 3195],
    [3072, 3544],
  ],
};

export const filterDungeons = ({ strict }: { strict: boolean }) => {
  const features = geojsondata.features;
  const titles = [];
  let dungeonFeatures;
  if (strict) {
    dungeonFeatures = features.filter((feature) => {
      return feature.convertedGeometry.every((geometry) => geometry.mapId > 0);
    });
  } else {
    dungeonFeatures = features.filter((feature) => {
      return feature.convertedGeometry.some((geometry) => geometry.mapId > 0);
    });
  }
  for (const dungeonFeature of dungeonFeatures) {
    const sanitizedTitle = sanitizeSongName(dungeonFeature?.properties?.title);
    titles.push(sanitizedTitle);
    const locations = [];
    for (const geometry of dungeonFeature.convertedGeometry) {
      locations.push(geometry.mapName);
    }
  }
  return titles;
};

export const filterDungeonOnly = () => {
  const features = geojsondata.features;
  const titles = [];
  const dungeonFeatures = features.filter((feature) => {
    return feature.convertedGeometry.some((geometry) => geometry.mapId > 0);
  });
  for (const dungeonFeature of dungeonFeatures) {
    const sanitizedTitle = sanitizeSongName(dungeonFeature?.properties?.title);
    titles.push(sanitizedTitle);
    const locations = [];
    for (const geometry of dungeonFeature.convertedGeometry) {
      locations.push(geometry.mapName);
    }
  }
  return titles;
};
const filterRegions = () => {
  const features = geojsondata.features;
  const zeahFeatures = new Set();
  features.forEach((feature) => {
    feature.geometry.coordinates.forEach((coordinates) => {
      coordinates.forEach((coordinate) => {
        if (
          coordinate[0] >= 2880 &&
          coordinate[1] >= 3195 &&
          coordinate[0] <= 3072 &&
          coordinate[1] <= 3544
        ) {
          zeahFeatures.add(extractSongTitle(feature?.properties?.title));
        }
      });
    });
  });
};

function extractSongTitle(htmlString: any) {
  // Regex to match content inside `title="..."` attribute
  const regex = /title="([^"]+)"/;
  const match = htmlString.match(regex);

  // Return the captured group (the title) or null if no match
  return match ? match[1] : null;
}
