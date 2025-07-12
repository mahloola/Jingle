import geojsondata from '../data/GeoJSON.ts';
import { groupedLinks } from '../data/map-links.ts';
import { sanitizeSongName } from '../utils/sanitizeSongName.ts';

const borders = {
  zeah: [
    [2880, 3195],
    [3072, 3544],
  ],
};

export const filterDungeons = () => {
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
  console.log(groupedLinks);
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
  console.log(zeahFeatures);
};

// const filterMapLinks = () => {
//   const flattenedLinks = Object.values(groupedLinks).flat();
//   const starts = flattenedLinks.map((link) => link.start);
//   const zeahStarts = new Set();
//   starts.forEach((start) => {
//     const coordinates = [start.x, start.y];
//     const isInRegion = geojsondata.features.some((feature) => {
//       const allFeatureCoordinates: number[][][] = [];
//       Object.values(feature.convertedGeometry).forEach((feature) => {
//         allFeatureCoordinates.push(feature.coordinates);
//       });
//       allFeatureCoordinates.flat();
//       return feature.convertedGeometry?.coordinates?.some((coordinatesArray: number[][][]) => {
//         return coordinatesArray.some((coordinate) => {
//           return (
//             borders.zeah[0][0] >= 2880 &&
//             borders.zeah[0][1] >= 3195 &&
//             borders.zeah[1][0] <= 3072 &&
//             borders.zeah[1][1] <= 3544
//           );
//         });
//       });
//     });
//   });
// };

function extractSongTitle(htmlString: any) {
  // Regex to match content inside `title="..."` attribute
  const regex = /title="([^"]+)"/;
  const match = htmlString.match(regex);

  // Return the captured group (the title) or null if no match
  return match ? match[1] : null;
}

console.log(filterDungeons());
