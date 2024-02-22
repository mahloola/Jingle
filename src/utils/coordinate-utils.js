const scaleFactor = 3;
// Ours refers to the pixel coordinates of the map grid we're using
// Theirs refers to the pixel coordinates taken from osrs wiki music info GeoJSON
export const toOurPixelCoordinates = ([x, y]) => [
  x * scaleFactor - 3108,
  -(y * scaleFactor) + 12450,
];
