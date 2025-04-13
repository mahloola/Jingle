import { Feature, Polygon, Position } from 'geojson';
import { decodeHTML } from './string-utils';
import geojsondata from '../data/GeoJSON';
import L from 'leaflet';
import { equals } from 'ramda';
import { booleanContains, booleanPointInPolygon, polygon } from '@turf/turf';
import mapMetadata from '../data/map-metadata';

export type Line = [Position, Position];

// these functions apply for CRS.Simple
export const convert = {
  ll_to_xy: (ll: L.LatLng): Position => [ll.lng, ll.lat],
  xy_to_ll: ([x, y]: Position): L.LatLng => L.latLng(y, x),
};

export const closePolygon = (coordinates: Position[]) => {
  const repairedPolygon = [...coordinates];
  if (
    coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
    coordinates[0][1] !== coordinates[coordinates.length - 1][1]
  ) {
    repairedPolygon.push(coordinates[0]);
  }
  return repairedPolygon;
};

export const featureMatchesSong = (songName: string) => (feature: Feature) => {
  const featureSongName = decodeHTML(
    feature.properties?.title.match(/>(.*?)</)[1],
  );
  return featureSongName?.trim() === songName.trim();
};

export const getDistance = (point1: Position, point2: Position) => {
  const dx = point2[0] - point1[0];
  const dy = point2[1] - point1[1];
  return Math.sqrt(dx * dx + dy * dy);
}; // some basic euclidian mathematics

export const getCenterOfPolygon = (points: Position[]) => {
  const xSum = points.reduce((acc, [x, _]) => acc + x, 0);
  const ySum = points.reduce((acc, [_, y]) => acc + y, 0);
  return [xSum / points.length, ySum / points.length];
};

export const getDistanceToPolygon = (point: Position, polygon: Position[]) => {
  const polygonLines = polygon.map(
    (point, i) => [point, polygon[(i + 1) % polygon.length]] as Line,
  );
  const distances = polygonLines.map((line) => getDistanceToLine(point, line));
  return Math.min(...distances);
};

export const getDistanceToLine = (point: Position, line: Line) => {
  const A = point[0] - line[0][0];
  const B = point[1] - line[0][1];
  const C = line[1][0] - line[0][0];
  const D = line[1][1] - line[0][1];

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0)
    // in case of 0 length line
    param = dot / lenSq;

  let xx, yy;

  if (param < 0) {
    xx = line[0][0];
    yy = line[0][1];
  } else if (param > 1) {
    xx = line[1][0];
    yy = line[1][1];
  } else {
    xx = line[0][0] + param * C;
    yy = line[0][1] + param * D;
  }

  const dx = point[0] - xx;
  const dy = point[1] - yy;

  return Math.sqrt(dx * dx + dy * dy);
};

// export const isFeatureVisibleOnMap = (feature: Feature<Polygon>) =>
//   feature.geometry.coordinates.some((polygon) =>
//     polygon.every((geojson_xy) => {
//       const [, y] = geojson_xy_to_leaflet_xy(geojson_xy);
//       return y > 0;
//     }),
//   );

export const findNearestPolygonWhereSongPlays = (
  song: string,
  clickedPosition: Position,
): {
  polygon: Feature<Polygon>;
  distance: number; // 0 if clicked inside polygon
} => {
  const songFeature = geojsondata.features.find(featureMatchesSong(song))!;
  const songPolygons = songFeature.geometry.coordinates.map(closePolygon);

  const nearestPolygon = songPolygons.sort((polygon1, polygon2) => {
    const c1 = getCenterOfPolygon(polygon1);
    const c2 = getCenterOfPolygon(polygon2);
    const d1 = getDistance(clickedPosition, c1);
    const d2 = getDistance(clickedPosition, c2);
    return d1 - d2;
  })[0];

  //if closest correct polgy is a gap, set outerPolygon to the actual parent poly, else iteself.
  const outerPolygon =
    songPolygons.find((repairedPolygon) => {
      if (!equals(repairedPolygon, nearestPolygon)) {
        return booleanContains(
          polygon([repairedPolygon]),
          polygon([nearestPolygon]),
        );
      }
      return false;
    }) || nearestPolygon;

  //find all gaps in this outer polygon
  const gaps = songPolygons.filter(
    (repairedPolygon) =>
      !equals(repairedPolygon, outerPolygon) &&
      booleanContains(polygon([outerPolygon]), polygon([repairedPolygon])),
  );

  //check user click is right or wrong:
  //for checking aginst click, convert everything to our coords
  //check if in outer poly
  const inOuterPoly = booleanPointInPolygon(
    clickedPosition,
    polygon([outerPolygon]),
  );
  // Check if the clicked point is inside any hole
  const isInsideGap = gaps.some((gap) =>
    booleanPointInPolygon(clickedPosition, polygon([gap])),
  );
  //merge the two
  const correct = inOuterPoly && !isInsideGap;

  const distance = correct
    ? 0
    : getDistanceToPolygon(clickedPosition, nearestPolygon);

  return {
    polygon: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [nearestPolygon],
      },
    } as Feature<Polygon>,
    distance: distance,
  };
};

export const switchLayer = (
  map: L.Map,
  tileLayer: L.TileLayer,
  mapId: number,
) => {
  const { bounds } = mapMetadata[mapId];

  const padding = 256;
  map.setMaxBounds([
    [bounds[0][1] - padding, bounds[0][0] - padding],
    [bounds[1][1] + padding, bounds[1][0] + padding],
  ]);

  tileLayer.getTileUrl = (coords: L.Coords) => {
    const { x, y, z } = coords;
    const tmsY = -y - 1;
    return `/rsmap-tiles/mapIdTiles/${mapId}/${z}/0_${x}_${tmsY}.png`;
  };
  tileLayer.redraw();
};
