import G, { Position } from 'geojson';
import { decodeHTML } from './string-utils';
import geojsondata, { ConvertedFeature } from '../data/GeoJSON';
import L from 'leaflet';
import { booleanContains, booleanPointInPolygon, polygon } from '@turf/turf';
import { ClickedPosition } from '../types/jingle';
import mapMetadata from '../data/map-metadata';
import { groupedLinks, MapLink } from '../data/map-links';
import {
  CHILD_PARENT_MAP_ID_PAIRS,
  MapIds,
  NESTED_MAP_IDS,
  LINKLESS_MAP_IDS,
} from './map-config';

type Line = [Position, Position];
type Polygon = Position[];

// these functions apply for CRS.Simple
export const convert = {
  ll_to_xy: (ll: L.LatLng): Position => [ll.lng, ll.lat],
  xy_to_ll: ([x, y]: Position): L.LatLng => L.latLng(y, x),
};

const closePolygon = (coordinates: Position[]) => {
  const repairedPolygon = [...coordinates];
  if (
    coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
    coordinates[0][1] !== coordinates[coordinates.length - 1][1]
  ) {
    repairedPolygon.push(coordinates[0]);
  }
  return repairedPolygon;
};

const featureMatchesSong = (songName: string) => (feature: G.Feature) => {
  const featureSongName = decodeHTML(
    feature.properties?.title.match(/>(.*?)</)[1],
  );
  return featureSongName?.trim() === songName.trim();
};

export const getCenterOfPolygon = (points: Position[]) => {
  const xSum = points.reduce((acc, [x, _]) => acc + x, 0);
  const ySum = points.reduce((acc, [_, y]) => acc + y, 0);
  return [xSum / points.length, ySum / points.length];
};

const getDistanceToPolygon = (point: Position, polygon: Position[]) => {
  const polygonLines = polygon.map(
    (point, i) => [point, polygon[(i + 1) % polygon.length]] as Line,
  );
  const distances = polygonLines.map((line) => getDistanceToLine(point, line));
  return Math.min(...distances);
};

const getDistanceToLine = (point: Position, line: Line) => {
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

export const findNearestPolygonWhereSongPlays = (
  song: string,
  clickedPosition: ClickedPosition,
): {
  mapId: number;
  feature: G.Feature<G.Polygon>;
  panTo: Position;
  distance: number; // 0 if clicked inside polygon
} => {
  const songFeature = geojsondata.features.find(featureMatchesSong(song))!;

  //all polys for for current song as per our mapId priorities - needed for donut polys.
  const { polygonCoords: songPolyCoords, mapId: songMapId } =
    getClosestMapIdPolys(songFeature, clickedPosition);
  const repairedPolygons = songPolyCoords.map((musicPoly) =>
    closePolygon(musicPoly),
  );

  //find nearest correct poly
  const nearestPolgonCoords = repairedPolygons.sort((polygon1, polygon2) => {
    const d1 = getTotalDistanceToPoly(clickedPosition, polygon1, songMapId);
    const d2 = getTotalDistanceToPoly(clickedPosition, polygon2, songMapId);
    return d1 - d2;
  })[0];

  const polyGroups = findPolyGroups(repairedPolygons);
  const [outerPolygon, ...gaps] = polyGroups.find((polyGroup) =>
    polyGroup.includes(nearestPolgonCoords),
  ) ?? [nearestPolgonCoords];

  //check if in outer poly
  const inOuterPoly = booleanPointInPolygon(
    clickedPosition.xy,
    polygon([outerPolygon]),
  );

  // Check if the clicked point is inside any gap
  const isInsideGap = gaps.some((gap) =>
    booleanPointInPolygon(clickedPosition.xy, polygon([gap])),
  );
  //merge the two. mapId check needed to filter overlapping coords in diff mapIds.
  const correct =
    inOuterPoly && !isInsideGap && clickedPosition.mapId == songMapId;

  const distance = correct
    ? 0
    : getTotalDistanceToPoly(clickedPosition, nearestPolgonCoords, songMapId);

  return {
    mapId: songMapId,
    feature: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: repairedPolygons,
      },
    } as G.Feature<G.Polygon>,
    panTo: getCenterOfPolygon(nearestPolgonCoords),
    distance: distance,
  };
};

export const switchLayer = (
  map: L.Map,
  tileLayer: L.TileLayer,
  mapId: number,
) => {
  const padding = mapId == 0 ? -64 : 256;
  const { bounds } = mapMetadata[mapId];
  const [min, max] = bounds;
  map.setMaxBounds([
    [min[1] - padding, min[0] - padding],
    [max[1] + padding, max[0] + padding],
  ]);

  tileLayer.getTileUrl = (coords: L.Coords) => {
    const { x, y, z } = coords;
    const tmsY = -y - 1;
    return `/rsmap-tiles/mapIdTiles/${mapId}/${z}/0_${x}_${tmsY}.png`;
  };
  tileLayer.redraw();
};

const findGaps = (repairedPolygons: Position[][]) => {
  return repairedPolygons.filter((innerPolygon) =>
    repairedPolygons.find(
      (outerPolygon) =>
        innerPolygon !== outerPolygon &&
        booleanContains(polygon([outerPolygon]), polygon([innerPolygon])),
    ),
  );
};

const findOuters = (repairedPolygons: Position[][]): Position[][] => {
  return repairedPolygons.filter(
    (candidate) =>
      !repairedPolygons.some(
        (other) =>
          candidate !== other &&
          booleanContains(polygon([other]), polygon([candidate])),
      ),
  );
};

const findPolyGroups = (repairedPolygons: Position[][]) => {
  const groups: Position[][][] = [];

  const gaps = findGaps(repairedPolygons);
  const outers = findOuters(repairedPolygons);

  outers.forEach((poly) => {
    const innerGaps = gaps.filter((gap) =>
      booleanContains(polygon([poly]), polygon([gap])),
    );
    groups.push([poly, ...innerGaps]);
  });

  return groups;
};

const getClosestMapIdPolys = (
  correctFeature: ConvertedFeature,
  clickedPosition: ClickedPosition,
): {
  mapId: number;
  polygonCoords: Polygon[];
} => {
  const polygons = correctFeature.convertedGeometry;

  //first prioritize polys on same mapId as guess
  const sameMapIdPolygons = polygons.filter(
    (poly) => poly.mapId == clickedPosition.mapId,
  );
  if (sameMapIdPolygons.length > 0) {
    return {
      polygonCoords: sameMapIdPolygons.map((poly) => poly.coordinates),
      mapId: clickedPosition.mapId,
    };
  }

  // next prioritize surface polys
  const surfacePolygons = polygons.filter(
    (poly) => poly.mapId === MapIds.Surface,
  );
  if (surfacePolygons.length > 0) {
    return {
      polygonCoords: surfacePolygons.map((poly) => poly.coordinates),
      mapId: 0,
    };
  }

  // Otherwise, find poly with the shortest distance to markerPosition
  let closestPolygon = polygons[0];
  let minDistance = Infinity;

  for (const poly of polygons) {
    const distance = getTotalDistanceToPoly(
      clickedPosition,
      poly.coordinates,
      poly.mapId,
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestPolygon = poly;
    }
  }

  const closestPolygons = polygons.filter(
    (polyData) => polyData.mapId === closestPolygon.mapId,
  );

  return [
    closestPolygons.map((polyData) => polyData.coordinates),
    closestPolygon.mapId,
  ];
};

const findClosestLink = (
  origin: Position | Position[],
  isPoly: boolean,
  validLinks: MapLink[],
) => {
  return validLinks.reduce(
    (closest, link) => {
      const linkStart = [link.start.x, link.start.y];
      const dist = isPoly
        ? getDistanceToPolygon(linkStart, origin as Position[])
        : getDistanceBetweenPoints(linkStart, origin as Position);

      return !closest.closestLink || dist < closest.distance
        ? { closestLink: link, distance: dist }
        : closest;
    },
    { closestLink: null as MapLink | null, distance: Infinity },
  );
};

const getMinDistToExit = (
  origin: Position | Position[],
  mapId: number,
  exitMapId = 0,
): [number, Position | Position[] | null] => {
  if (mapId == MapIds.Surface) {
    return [0, origin];
  }

  const isPoly = Array.isArray(origin[0]);
  const mapName = mapMetadata[mapId].name;

  const links = groupedLinks[mapName] ?? [];

  const validLinks = links.filter((link) => link.end.mapId === exitMapId);
  if (validLinks.length === 0) return [0, null];

  // Find the closest link
  const { closestLink, distance } = findClosestLink(origin, isPoly, validLinks);

  if (closestLink) {
    return [distance, [closestLink.end.x, closestLink.end.y]] as [
      number,
      Position,
    ];
  }

  // If no valid closestLink, return a fallback value
  return [0, null as Position | null];
};

const getDistanceBetweenPoints = (a: Position, b: Position) => {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  return Math.sqrt(dx * dx + dy * dy);
};

const isPoint = (a: Position | Position[]): a is Position =>
  !Array.isArray(a[0]);
const isPolygon = (a: Position | Position[]): a is Position[] =>
  Array.isArray(a[0]);

const getDistanceOnMapId = (
  a: Position | Position[],
  b: Position | Position[],
): number => {
  if (isPoint(a) && isPoint(b)) {
    return getDistanceBetweenPoints(a, b);
  } else if (isPolygon(a) && isPoint(b)) {
    return getDistanceToPolygon(b, a);
  } else if (isPoint(a) && isPolygon(b)) {
    return getDistanceToPolygon(a, b);
  }
  console.error('getDistanceOnMapId - a: ', a);
  console.error('getDistanceOnMapId - b: ', b);
  throw new Error('getDistanceOnMapId - invalid arguments');
};

const getNestedMinDistToSurfce = (
  origin: Position | Position[],
  childMapId: number,
): [number, Position | Position[] | null] => {
  const childParentMapIdPair = CHILD_PARENT_MAP_ID_PAIRS.find(
    (pair) => pair[0] == childMapId,
  );
  if (!childParentMapIdPair) {
    return [Infinity, null];
  }
  console.log(childParentMapIdPair);
  const parentMapId = childParentMapIdPair[1];

  const [childExitDist, childExit] = getMinDistToExit(
    origin,
    childMapId,
    parentMapId,
  );
  const [parentExitDist, parentExit] = getMinDistToExit(
    childExit!,
    parentMapId,
    MapIds.Surface,
  );
  console.log(parentExit);
  const dist = childExitDist + parentExitDist;
  return [dist, parentExit];
};

const handleNestedDungeons = (
  clickedPosition: ClickedPosition,
  poly: Position[],
  polyMapId: number,
): [boolean, number] => {
  if (clickedPosition.mapId == polyMapId) {
    return [false, Infinity];
  } // let the other function handle it

  const areInSameNestedRegion = (a: number, b: number) => {
    return CHILD_PARENT_MAP_ID_PAIRS.some(
      (pair) => pair.includes(a) && pair.includes(b),
    );
  };

  //this only works because the inner mapIds only have one exit outside, and the outers have only one entrance inside.
  //wait lemme confirm actually sec. ok yeah we good, wiki map is just glitched again, only 1 in game.
  if (areInSameNestedRegion(clickedPosition.mapId, polyMapId)) {
    const [pointExitDist, temp1] = getMinDistToExit(
      clickedPosition.xy,
      clickedPosition.mapId,
      polyMapId,
    );
    const [polyExitDist, temp2] = getMinDistToExit(
      poly,
      polyMapId,
      clickedPosition.mapId,
    );
    const totalDist = pointExitDist + polyExitDist;
    return [true, totalDist];
  }

  //else if in different nested regions
  const pointNested = NESTED_MAP_IDS.includes(clickedPosition.mapId);
  const polyNested = NESTED_MAP_IDS.includes(polyMapId);
  if (!pointNested && !polyNested) {
    return [false, Infinity];
  }

  const [pointDist, pointSurfaceExit] = pointNested
    ? getNestedMinDistToSurfce(clickedPosition.xy, clickedPosition.mapId)
    : getMinDistToExit(clickedPosition.xy, clickedPosition.mapId);
  const [polyDist, polySurfaceExit] = polyNested
    ? getNestedMinDistToSurfce(poly, polyMapId)
    : getMinDistToExit(poly, polyMapId);
  if (!pointSurfaceExit || !polySurfaceExit) {
    return [false, Infinity];
  }

  const surfaceDist = getDistanceOnMapId(pointSurfaceExit, polySurfaceExit);
  const dist = pointDist + surfaceDist + polyDist;
  return [true, dist];
};

const getTotalDistanceToPoly = (
  clickedPosition: ClickedPosition,
  poly: Position[],
  polyMapId: number,
) => {
  const [handledNested, dist] = handleNestedDungeons(
    clickedPosition,
    poly,
    polyMapId,
  );
  if (handledNested) {
    return dist;
  }

  //same map id
  if (clickedPosition.mapId == polyMapId) {
    return getDistanceToPolygon(clickedPosition.xy, poly);
  }

  //diff map ids
  const [pointDistToSurface, pointSurfaceOrigin] = getMinDistToExit(
    clickedPosition.xy,
    clickedPosition.mapId,
  );
  const [polyDistToSurface, polySurfaceOrigin] = getMinDistToExit(
    poly,
    polyMapId,
  );
  if (pointSurfaceOrigin == null || polySurfaceOrigin == null) {
    return Infinity;
  }

  return (
    pointDistToSurface +
    polyDistToSurface +
    getDistanceOnMapId(pointSurfaceOrigin, polySurfaceOrigin)
  );
};
