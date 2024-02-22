import { decodeHTML } from "./string-utils";

export const featureMatchesSong = (songName) => (feature) => {
  const featureSongName = decodeHTML(feature.properties.title.match(/>(.*?)</)[1]);
  return featureSongName === songName;
};
