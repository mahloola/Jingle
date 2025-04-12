import { Feature, Polygon, Position } from 'geojson';
import { Line, Point } from '../types/geometry';
import { decodeHTML } from './string-utils';
import geojsondata from '../data/GeoJSON';
import L from 'leaflet';
import { equals } from 'ramda';
import { booleanContains, booleanPointInPolygon, polygon } from '@turf/turf';

const scaleFactor = 3;
// Ours refers to the pixel coordinates of the map grid we're using
// Theirs refers to the pixel coordinates taken from osrs wiki music info GeoJSON
export const toOurPixelCoordinates = ([x, y]: Position) =>
  [x * scaleFactor - 3152, -(y * scaleFactor) + 12400] as Point;

export const closePolygon = (coordinates: number[][]) => {
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

export const calculateDistance = (
  point1: [number, number],
  point2: [number, number],
) => {
  const dx = point2[0] - point1[0];
  const dy = point2[1] - point1[1];
  return Math.sqrt(dx * dx + dy * dy);
}; // some basic euclidian mathematics

export const getCenterOfPolygon = (points: Point[]) => {
  const xSum = points.reduce((acc, [x, _]) => acc + x, 0);
  const ySum = points.reduce((acc, [_, y]) => acc + y, 0);
  return [xSum / points.length, ySum / points.length] as Point;
};

export const getDistanceToPolygon = (
  point: [number, number],
  polygon: Point[],
) => {
  const polygonLines = polygon.map(
    (point, i) => [point, polygon[(i + 1) % polygon.length]] as Line,
  );
  const distances = polygonLines.map((line) => getDistanceToLine(point, line));
  return Math.min(...distances);
};

export const getDistanceToLine = (point: [number, number], line: Line) => {
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

export const isFeatureVisibleOnMap = (feature: Feature<Polygon>) =>
  feature.geometry.coordinates.some((polygon) =>
    polygon.every((point) => {
      const [, y] = toOurPixelCoordinates(point);
      return y > 0;
    }),
  );

export const findNearestPolygonWhereSongPlays = (
  map: L.Map,
  song: string,
  leaflet_ll_click: L.LatLng,
): {
  polygon: Feature<Polygon>;
  clicked: boolean;
  distance: number;
} => {
  // prefixes represent 3 coordinate systems:
  // 1. geojson_xy_* geojson coordinates [x, y]
  //   - song->location data (/data/GeoJSON.ts)
  // 2. leaflet_xy_* leaflet coordinates [x, y]
  //   - used as an intermediary between the two
  //   - used for calculations
  // 3. leaflet_ll_* leaflet coordinates { lat, lng }
  //   - received as input in onClick event
  //   - used to display points and polygons on the map
  // use converstion functions to convert between the two

  const leaflet_xy_click = leaflet_ll_to_leaflet_xy(map, leaflet_ll_click);
  const correctFeature = geojsondata.features.find(featureMatchesSong(song))!;
  const geojson_xy_correctPolygons = correctFeature.geometry.coordinates;
  const geojson_xy_repairedPolygons = geojson_xy_correctPolygons.map(
    closePolygon,
  ) as Point[][];

  const geojson_xy_nearestPolygon = geojson_xy_repairedPolygons.sort(
    (polygon1: Point[], polygon2: Point[]) => {
      const c1 = getCenterOfPolygon(polygon1.map(geojson_xy_to_leaflet_xy));
      const c2 = getCenterOfPolygon(polygon2.map(geojson_xy_to_leaflet_xy));
      const d1 = calculateDistance(leaflet_xy_click, c1);
      const d2 = calculateDistance(leaflet_xy_click, c2);
      return d1 - d2;
    },
  )[0];

  //if closest correct polgy is a gap, set outerPolygon to the actual parent poly, else iteself.
  const geojson_xy_outerPolygon =
    geojson_xy_repairedPolygons.find((repairedPolygon) => {
      if (!equals(repairedPolygon, geojson_xy_nearestPolygon)) {
        return booleanContains(
          polygon([repairedPolygon]),
          polygon([geojson_xy_nearestPolygon]),
        );
      }
      return false;
    }) || geojson_xy_nearestPolygon;

  //find all gaps in this outer polygon
  const geojson_xy_gaps = geojson_xy_repairedPolygons.filter(
    (geojson_xy_repairedPolygon) =>
      !equals(geojson_xy_repairedPolygon, geojson_xy_outerPolygon) &&
      booleanContains(
        polygon([geojson_xy_outerPolygon]),
        polygon([geojson_xy_repairedPolygon]),
      ),
  );

  const geojson_xy_correctPolygonsWithGapsFilled = [
    geojson_xy_outerPolygon,
    ...geojson_xy_gaps,
  ];

  //check user click is right or wrong:
  //for checking aginst click, convert everything to our coords
  const leaflet_xy_outerPolygon = geojson_xy_outerPolygon.map(
    geojson_xy_to_leaflet_xy,
  );
  const ourGaps =
    geojson_xy_gaps?.map((gap) => gap.map(geojson_xy_to_leaflet_xy)) ?? [];
  //check if in outer poly
  const inOuterPoly = booleanPointInPolygon(
    leaflet_xy_click,
    polygon([leaflet_xy_outerPolygon]),
  );
  // Check if the clicked point is inside any hole
  const isInsideGap = ourGaps.some((gap) =>
    booleanPointInPolygon(leaflet_xy_click, polygon([gap])),
  );
  //merge the two
  const correct = inOuterPoly && !isInsideGap;

  const distance = correct
    ? 0
    : Math.min(
        ...correctFeature.geometry.coordinates.map((polygon) =>
          getDistanceToPolygon(
            leaflet_xy_click,
            polygon.map(([x, y]) => geojson_xy_to_leaflet_xy([x, y])),
          ),
        ),
      );

  const leaflet_ll_correctPolygons =
    geojson_xy_correctPolygonsWithGapsFilled.map((geojson_xy_polygon) =>
      geojson_xy_polygon
        .map(([x, y]) => geojson_xy_to_leaflet_xy([x, y]))
        .map((leaflet_xy) => leaflet_xy_to_leaflet_ll(map, leaflet_xy))
        .map(({ lat, lng }) => [lng, lat]),
    );

  return {
    polygon: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: leaflet_ll_correctPolygons,
      },
    } as Feature<Polygon>,
    clicked: correct,
    distance: distance,
  };
};

export const leaflet_ll_to_leaflet_xy = (
  map: L.Map,
  leaflet_ll: L.LatLng,
): Point => {
  const zoom = map.getMaxZoom();
  const { x, y } = map.project(leaflet_ll, zoom);
  return [x, y];
};

export const leaflet_xy_to_leaflet_ll = (
  map: L.Map,
  leaflet_xy: Point,
): L.LatLng => {
  const zoom = map.getMaxZoom();
  const [x, y] = leaflet_xy;
  return map.unproject(L.point(x, y), zoom);
};

export const geojson_xy_to_leaflet_xy = ([x, y]: Point): Point =>
  [x * scaleFactor - 3152, -(y * scaleFactor) + 12400] as Point;

export const leaflet_xy_to_geojson_xy = ([x, y]: Point): Point =>
  [(x + 3152) / scaleFactor, (y - 12400) / scaleFactor] as Point;
