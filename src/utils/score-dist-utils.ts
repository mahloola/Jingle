import { LatLng, polygon } from "leaflet";
import { Line, Point } from "../types/geometry";
import { ConvertedFeature } from "../data/GeoJSON";
import { CHILD_PARENT_MAP_ID_PAIRS, MapIds, NESTED_MAP_IDS } from "./map-config";
import { groupedLinks, LinkData } from "../data/GroupedLinks";
import basemaps from "../data/basemaps";

export const getDistanceToPolygon = (
    point: [number, number] | Point,
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

//return polys, mapId.
export const GetClosestMapIdPolys = (correctFeature: ConvertedFeature,
    markerPosition: LatLng, markerMapId: number): [number[][][], number] => {

    const calculateDistanceToPoly = (poly: Point[], mapId: number) => {
        return GetTotalDistanceToPoly([markerPosition.lng, markerPosition.lat], markerMapId, poly, mapId);
    };

    const currentPolyDatas = correctFeature.convertedGeometry;

    //first prioritize polys on same mapId as guess
    const sameMapIdPolyDatas = currentPolyDatas.filter((polyData) => polyData.mapId == markerMapId)
    if (sameMapIdPolyDatas.length > 0) { return [sameMapIdPolyDatas.map(polyData => polyData.coordinates), markerMapId] }


    //next prioritize surface polys
    const surfacePolys = currentPolyDatas.filter((polyData) => polyData.mapId == MapIds.Surface)
    if (surfacePolys.length > 0) { return [surfacePolys.map(polyData => polyData.coordinates), 0] }

    //Otherwise, find poly with the shortest distance to markerPosition
    let closestPolyData = currentPolyDatas[0];
    let minDistance = Infinity;

    for (let polyData of currentPolyDatas) {
        const distance = calculateDistanceToPoly(polyData.coordinates as Point[], polyData.mapId);

        if (distance < minDistance) {
            minDistance = distance;
            closestPolyData = polyData;
        }
    }

    const closestPolygons = currentPolyDatas.filter(
        polyData => polyData.mapId === closestPolyData.mapId
    );

    return [closestPolygons.map(polyData => polyData.coordinates), closestPolyData.mapId];

}

const FindClosestLink = (origin: Point | Point[], isPoly: boolean, validLinks: LinkData[]) => {

    return validLinks.reduce(
        (closest, link) => {
            const dist = isPoly ? getDistanceToPolygon([link.start.x, link.start.y], origin as Point[])
                : Math.hypot(link.start.x - (origin as Point)[0], link.start.y - (origin as Point)[1]);

            return !closest.closestLink || dist < closest.distance
                ? { closestLink: link, distance: dist }
                : closest;
        },
        { closestLink: null as LinkData | null, distance: Infinity }
    );
}

export const GetMinDistToExit = (origin: Point | Point[], mapId: number, exitMapId = 0): [number, Point | Point[] | null] => {

    if (mapId == MapIds.Surface) { return [0, origin] }

    const isPoly = Array.isArray(origin[0]);
    const mapName = basemaps[mapId].name;

    const links = groupedLinks[mapName] ?? [];

    const validLinks = links.filter(link => link.end.mapId === exitMapId);
    if (validLinks.length === 0) return [0, null];

    // Find the closest link
    const { closestLink, distance } = FindClosestLink(origin, isPoly, validLinks);

    if (closestLink) {
        return [
            distance,
            [closestLink.end.x, closestLink.end.y]
        ] as [number, Point];
    }

    // If no valid closestLink, return a fallback value
    return [0, null as Point | null];
}

const DistanceBetweenPoints = (a: Point, b: Point) => {
    return Math.hypot(
        (a as Point)[0] - (b as Point)[0],
        (a as Point)[1] - (b as Point)[1]
    ) as number;
}

const DistanceOnMapId = (a: Point | Point[], b: Point | Point[]): number => {

    const aIsPoly = Array.isArray(a[0]);
    const bIsPoly = Array.isArray(b[0]);

    if (!aIsPoly && !bIsPoly) {
        return DistanceBetweenPoints(a as Point, b as Point);
    }
    else if (aIsPoly && !bIsPoly) {
        return getDistanceToPolygon(b as Point, a as Point[]);
    }
    else if (!aIsPoly && bIsPoly) {
        return getDistanceToPolygon(a as Point, b as Point[]);
    }
    else {
        console.log("Both inputs are polys. Something weird is happening.");
        return Infinity;
    }
}


const GetNestedMinDistToSurfce = (origin: Point | Point[], childMapId: number): [number, Point | Point[] | null] => {

    const childParentMapIdPair = CHILD_PARENT_MAP_ID_PAIRS.find(pair => pair[0] == childMapId);
    if (!childParentMapIdPair) {return [Infinity, null]; }
    console.log(childParentMapIdPair);
    const parentMapId = childParentMapIdPair[1];

    const [childExitDist, childExit] = GetMinDistToExit(origin, childMapId, parentMapId);
    const [parentExitDist, parentExit] = GetMinDistToExit(childExit!, parentMapId, MapIds.Surface);
    console.log(parentExit);
    const dist = childExitDist + parentExitDist;
    return [dist, parentExit];
}


const HandleNestedDungeons = (point: Point, pointMapId: number, poly: Point[], polyMapId: number): [boolean, number] => {

    if (pointMapId == polyMapId) { return [false, Infinity]; } // let the other function handle it

    const AreInSameNestedRegion = (a: number, b: number) => {
        return CHILD_PARENT_MAP_ID_PAIRS.some(pair => pair.includes(a) && pair.includes(b));
    };

    //this only works because the inner mapIds only have one exit outside, and the outers have only one entrance inside.
    //wait lemme confirm actually sec. ok yeah we good, wiki map is just glitched again, only 1 in game.
    if (AreInSameNestedRegion(pointMapId, polyMapId)) {
        const [pointExitDist, temp1] = GetMinDistToExit(point, pointMapId, polyMapId);
        const [polyExitDist, temp2] = GetMinDistToExit(poly, polyMapId, pointMapId);
        const totalDist = pointExitDist + polyExitDist;
        return [true, totalDist];
    }
    
    //else if in different nested regions
    const pointNested = NESTED_MAP_IDS.includes(pointMapId);
    const polyNested = NESTED_MAP_IDS.includes(polyMapId);
    if (!pointNested && !polyNested) {return [false, Infinity] }

    const [pointDist, pointSurfaceExit] = pointNested ? GetNestedMinDistToSurfce(point, pointMapId) : GetMinDistToExit(point, pointMapId);
    const [polyDist, polySurfaceExit] = polyNested ? GetNestedMinDistToSurfce(poly, polyMapId) : GetMinDistToExit(poly, polyMapId);
    if (!pointSurfaceExit || !polySurfaceExit) {return [false, Infinity]; }

    const surfaceDist = DistanceOnMapId(pointSurfaceExit, polySurfaceExit);
    const dist = pointDist + surfaceDist + polyDist;
    return [true, dist];
}


export const GetTotalDistanceToPoly = (point: Point, pointMapId: number, poly: Point[], polyMapId: number) => {

    const [handledNested, dist] = HandleNestedDungeons(point, pointMapId, poly, polyMapId);
    if (handledNested) { return dist; }

    //same map id
    if(pointMapId == polyMapId){return getDistanceToPolygon(point, poly);}
    
    //diff map ids
    const [pointDistToSurface, pointSurfaceOrigin] = GetMinDistToExit(point, pointMapId);
    const [polyDistToSurface, polySurfaceOrigin] = GetMinDistToExit(poly, polyMapId);
    if (pointSurfaceOrigin == null || polySurfaceOrigin == null) { return Infinity; }
    
    return pointDistToSurface + polyDistToSurface + DistanceOnMapId(pointSurfaceOrigin, polySurfaceOrigin);

}
