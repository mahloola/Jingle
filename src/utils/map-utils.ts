import { booleanContains, booleanPointInPolygon, polygon } from '@turf/turf';
import G, { Position } from 'geojson';
import L from 'leaflet';
import { CENTER_COORDINATES, DEFAULT_PREFERENCES } from '../constants/defaults';
import geojsondata, { ConvertedFeature } from '../data/GeoJSON';
import { groupedLinks, LinkPoint, MapLink } from '../data/map-links';
import mapMetadata from '../data/map-metadata';
import { ClickedPosition } from '../types/jingle';
import { loadPreferencesFromBrowser } from './browserUtil';
import {MapIds, NESTED_GROUPS, NESTED_MAP_IDS } from './map-config';
import { decodeHTML } from './string-utils';

type Line = [Position, Position];
type Polygon = Position[];

// these functions apply for CRS.Simple
export const convert = {
  ll_to_xy: (ll: L.LatLng): Position => [ll.lng, ll.lat],
  xy_to_ll: ([x, y]: Position): L.LatLng => L.latLng(y, x),
};

const closePolygon = (coordinates: Polygon): Polygon => {
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
  const featureSongName = decodeHTML(feature.properties?.title.match(/>(.*?)</)[1]);
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

export const findAllAnswerPolygonsForSong = (song: string): Map<number, Polygon[]> => {
  const songFeature = geojsondata.features.find(featureMatchesSong(song))!;
  const polygons = songFeature.convertedGeometry;

  const groupedSongPolygons = new Map<number, Polygon[]>();

  for (const polygon of polygons) {
    if (!groupedSongPolygons.has(polygon.mapId)) {
      groupedSongPolygons.set(polygon.mapId, []);
    }

    groupedSongPolygons.get(polygon.mapId)!.push(closePolygon(polygon.coordinates));
  }

  return groupedSongPolygons;
};


export const findNearestPolygonWhereSongPlays = (
  song: string,
  clickedPosition: ClickedPosition,
): {
  mapId: number;
  featuresData: { mapId: number; feature: G.Feature<G.Polygon> }[];
  panTo: Position;
  distance: number; // 0 if clicked inside polygon
} => {
  const songFeature = geojsondata.features.find(featureMatchesSong(song))!;
  const allSongAnswerPolygons = findAllAnswerPolygonsForSong(song);

  //all polys for for current song as per our mapId priorities - needed for donut polys.
  const { polygonCoords: songPolyCoords, mapId: songMapId } = getClosestMapIdPolys(
    songFeature,
    clickedPosition,
  );
  const repairedPolygons = songPolyCoords.map((musicPoly) => closePolygon(musicPoly));

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
  const inOuterPoly = booleanPointInPolygon(clickedPosition.xy, polygon([outerPolygon]));

  // Check if the clicked point is inside any gap
  const isInsideGap = gaps.some((gap) => booleanPointInPolygon(clickedPosition.xy, polygon([gap])));
  //merge the two. mapId check needed to filter overlapping coords in diff mapIds.
  const correct = inOuterPoly && !isInsideGap && clickedPosition.mapId == songMapId;

  const distance = correct
    ? 0
    : getTotalDistanceToPoly(clickedPosition, nearestPolgonCoords, songMapId);

  const featuresData = Array.from(allSongAnswerPolygons.entries()).map(([currMapId, polygons]) => {
    return {
      mapId: currMapId,
      feature: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: polygons,
        },
      } as G.Feature<G.Polygon>,
    };
  });

  return {
    mapId: songMapId,
    featuresData: featuresData,
    panTo: getCenterOfPolygon(nearestPolgonCoords),
    distance: distance,
  };
};

export const switchLayer = (map: L.Map, tileLayer: L.TileLayer, mapId: number) => {
  const padding = mapId == 0 ? -64 : 256;
  const { bounds } = mapMetadata.find(map => map.mapId == mapId)!;
  const [min, max] = bounds;
  map.setMaxBounds([
    [min[1] - padding, min[0] - padding],
    [max[1] + padding, max[0] + padding],
  ]);

  tileLayer.getTileUrl = (coords: L.Coords) => {
    const { x, y, z } = coords;
    const tmsY = -y - 1;
    // return `./rsmap-tiles/mapIdTiles/${mapId}/${z}/0_${x}_${tmsY}.png`;
    return `https://jingle.mahloola.com/${mapId}/${z}/0_${x}_${tmsY}.png`;
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
        (other) => candidate !== other && booleanContains(polygon([other]), polygon([candidate])),
      ),
  );
};

// Extracted helper function for navigation stack logic
export const handleNavigationStackUpdate = (
  newMapId: number,
  currentMapId: number,
  navigationStack: Array<{
    mapId: number;
    coordinates: [number, number];
  }> | null,
  setIsUnderground: (value: boolean) => void,
): void => {
  const lastEntryMapId = navigationStack?.[navigationStack.length - 1]?.mapId;

  if (newMapId === lastEntryMapId) {
    // Returning to previous location
    navigationStack?.pop();
    if (!navigationStack?.length) {
      setIsUnderground(false);
    }
  } else {
    if (currentMapId !== 0) return;
    // otherwise we're coming from surface so add to stack
    navigationStack?.push({
      mapId: currentMapId,
      coordinates: CENTER_COORDINATES,
    });
    setIsUnderground(true);
  }
};

export const recalculateNavigationStack = (
  newMapId: number,
  newMapCenterPosition: Position,
  navigationStack: Array<{
    mapId: number;
    coordinates: [number, number];
  }> | null,
  setIsUnderground: (value: boolean) => void,
): void => {
  const clearNavigationStack = () => {
    while (navigationStack?.length) {
      navigationStack.pop();
    }
  };

  setIsUnderground(false);
  if (newMapId != 0) {
    setIsUnderground(true);
  }

  clearNavigationStack();

  fillNavigationStack(newMapId, newMapCenterPosition, navigationStack);
  navigationStack?.pop(); //pop the current mapId
};

  const fillNavigationStack = (
    currentMapId: number,
    origin: Position,
    navigationStack: Array<{
      mapId: number;
      coordinates: [number, number];
    }> | null,
  ) => {
    const typedOrigin = origin as [number, number];
    const convertedOrigin: [number, number] = origin ? [origin[1], origin[0]] : CENTER_COORDINATES;

    if (currentMapId == MapIds.Surface) {
      navigationStack?.push({ mapId: currentMapId, coordinates: convertedOrigin });
      return;
    }

    const parentMapId = GetParentMapId(currentMapId);
    const [dist, exit] = getMinDistToExit(typedOrigin, currentMapId, parentMapId);
    const exitCoords = exit ? [exit![1], exit![0]] : CENTER_COORDINATES;

    if (exit) {
      fillNavigationStack(parentMapId, exit as Position, navigationStack);
    }

    navigationStack?.push({ mapId: currentMapId, coordinates: convertedOrigin });
  };
  


const findPolyGroups = (repairedPolygons: Polygon[]) => {
  const groups: Polygon[][] = [];

  const gaps = findGaps(repairedPolygons);
  const outers = findOuters(repairedPolygons);

  outers.forEach((poly) => {
    const innerGaps = gaps.filter((gap) => booleanContains(polygon([poly]), polygon([gap])));
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

  //TEMPORARY. DETECT THIS PROPERLY.
  const useLayerPreferences: boolean = window.location.pathname.includes('/practice');
  const currentPreferences = loadPreferencesFromBrowser() || DEFAULT_PREFERENCES;

  //first prioritize polys on same mapId as guess - depending on surface and dungeons enabled or not

  const sameMapIdPolygons = polygons.filter((poly) => poly.mapId == clickedPosition.mapId);
  if (
    sameMapIdPolygons.length > 0 &&
    (!useLayerPreferences ||
      (clickedPosition.mapId == MapIds.Surface && currentPreferences.surfaceSelected) ||
      (clickedPosition.mapId != MapIds.Surface && currentPreferences.undergroundSelected))
  ) {
    return {
      polygonCoords: sameMapIdPolygons.map((poly) => poly.coordinates),
      mapId: clickedPosition.mapId,
    };
  }

  // next prioritize surface polys - only if surface is enabled
  const surfacePolygons = polygons.filter((poly) => poly.mapId === MapIds.Surface);
  if (surfacePolygons.length > 0 && (!useLayerPreferences || currentPreferences.surfaceSelected)) {
    return {
      polygonCoords: surfacePolygons.map((poly) => poly.coordinates),
      mapId: 0,
    };
  }

  // Otherwise, find poly with the shortest distance to markerPosition - accounting for surface/dungeon prefs
  let closestPolygon = polygons[0];
  let minDistance = Infinity;

  for (const poly of polygons) {
    const distance = getTotalDistanceToPoly(clickedPosition, poly.coordinates, poly.mapId);

    if (
      distance < minDistance &&
      (!useLayerPreferences ||
        (currentPreferences.surfaceSelected && poly.mapId == MapIds.Surface) ||
        (currentPreferences.undergroundSelected && poly.mapId != MapIds.Surface))
    ) {
      minDistance = distance;
      closestPolygon = poly;
    }
  }

  const closestPolygons = polygons.filter((polyData) => polyData.mapId === closestPolygon.mapId);

  return {
    polygonCoords: closestPolygons.map((polyData) => polyData.coordinates),
    mapId: closestPolygon.mapId,
  };
};

const findClosestLink = (origin: Position | Position[], isPoly: boolean, validLinks: MapLink[]) => {
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
  const mapName = mapMetadata.find(mapData => mapData.mapId == mapId)!.name;

  const links = groupedLinks[mapName] ?? [];

  const validLinks = links.filter((link) => link.end.mapId === exitMapId);
  if (validLinks.length === 0) return [0, null];

  // Find the closest link
  const { closestLink, distance } = findClosestLink(origin, isPoly, validLinks);

  if (closestLink) {
    return [distance, [closestLink.end.x, closestLink.end.y]] as [number, Position];
  }

  // If no valid closestLink, return a fallback value
  return [0, null as Position | null];
};

const getDistanceBetweenPoints = (a: Position, b: Position) => {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  return Math.sqrt(dx * dx + dy * dy);
};

const isPoint = (a: Position | Position[]): a is Position => !Array.isArray(a[0]);
const isPolygon = (a: Position | Position[]): a is Position[] => Array.isArray(a[0]);

const getDistanceOnMapId = (a: Position | Position[], b: Position | Position[]): number => {
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

const getNestedMinDistToTargetMapId = (
  origin: Position | Position[],
  nestedMapId: number,
  exitMapId: number,
): [number, Position | Position[] | null] => {

  const nestedGroup = NESTED_GROUPS.find((group) => group.includes(nestedMapId));
  const currIndex = nestedGroup?.findIndex(nedstedGroupMapId => nedstedGroupMapId == nestedMapId);
  const exitIndex = exitMapId == MapIds.Surface ? -1 : nestedGroup?.findIndex(nestedGroupMapId => nestedGroupMapId == exitMapId)

  if (!nestedGroup || !currIndex) {
    return [Infinity, null];
  }

  const [totalDistToTarget, targetExit] = getNestedMinDistToTargetMapIdByIndex(origin, nestedGroup, currIndex, exitIndex);
  return [totalDistToTarget, targetExit];
};

const getNestedMinDistToTargetMapIdByIndex = (
  origin: Position | Position[],
  nestedGroup: MapIds[],
  currIndex: number,
  finalIndex = -1,

) : [number, Position | Position[] | null] => {

  if(currIndex == finalIndex){ 
    return [0, origin];
  }

  const currMapId = nestedGroup[currIndex];
  const parentIndex = currIndex - 1;
  const parentMapId = nestedGroup[parentIndex];

  const [currExitDist, currExit] = getMinDistToExit(origin, currMapId, parentMapId);
  
  //if no exit found, return infinity
  if(currExit == null){return [Infinity, null];}

  const [remainingDistToSurface, finalExit] = getNestedMinDistToTargetMapIdByIndex(currExit, nestedGroup, parentIndex, finalIndex);
  return [currExitDist + remainingDistToSurface, finalExit];

}

export const GetParentMapId = (currentMapId: number): number => {
  if (NESTED_MAP_IDS.includes(currentMapId)) {
    const nestedGroup = NESTED_GROUPS.find((group) => group.includes(currentMapId))!;
    const currentIndex = nestedGroup?.findIndex(nestedMapId => nestedMapId == currentMapId)!;
    return nestedGroup[currentIndex-1];
  } else {
    return MapIds.Surface;
  }
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
    return NESTED_GROUPS.some((group) => group.includes(a) && group.includes(b));
  };
  
  //higher depth nesting
  if(areInSameNestedRegion(clickedPosition.mapId, polyMapId)){

    const currMapId = Math.max(clickedPosition.mapId, polyMapId);
    const finalMapId = Math.min(clickedPosition.mapId, polyMapId);
    const currOrigin = polyMapId == currMapId ? poly : clickedPosition.xy;
    const targetPoint = polyMapId == finalMapId ? poly : clickedPosition.xy;    
    
    const [originExitDist, originExit] = getNestedMinDistToTargetMapId(currOrigin, currMapId, finalMapId);
    if(originExit == null){return [false, Infinity];}

    const totalDist = originExitDist + getDistanceOnMapId(originExit, targetPoint);
    return [true, totalDist];

  }

  //else if in different nested regions
  const pointNested = NESTED_MAP_IDS.includes(clickedPosition.mapId);
  const polyNested = NESTED_MAP_IDS.includes(polyMapId);
  if (!pointNested && !polyNested) {
    return [false, Infinity];
  }

  const [pointDist, pointSurfaceExit] = pointNested
    ? getNestedMinDistToTargetMapId(clickedPosition.xy, clickedPosition.mapId, MapIds.Surface)
    : getMinDistToExit(clickedPosition.xy, clickedPosition.mapId);
  const [polyDist, polySurfaceExit] = polyNested
    ? getNestedMinDistToTargetMapId(poly, polyMapId, MapIds.Surface)
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
  const [handledNested, dist] = handleNestedDungeons(clickedPosition, poly, polyMapId);
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
  const [polyDistToSurface, polySurfaceOrigin] = getMinDistToExit(poly, polyMapId);
  if (pointSurfaceOrigin == null || polySurfaceOrigin == null) {
    return Infinity;
  }

  return (
    pointDistToSurface +
    polyDistToSurface +
    getDistanceOnMapId(pointSurfaceOrigin, polySurfaceOrigin)
  );
};

export const panMapToLinkPoint = (map: L.Map, end: LinkPoint) => {
    const padding = end.mapId == 0 ? -64 : 256;
    const panBuffer = 10000;
    const { bounds } = mapMetadata.find(map => map.mapId == end.mapId)!;
    const [min, max] = bounds;

    map.setMaxBounds([
      [min[1] - padding - panBuffer, min[0] - padding - panBuffer],
      [max[1] + padding + panBuffer, max[0] + padding + panBuffer],
    ]);

    map.panTo([end.y, end.x], { animate: false });

    map.setMaxBounds([
      [min[1] - padding, min[0] - padding],
      [max[1] + padding, max[0] + padding],
    ]);
}
