import { decodeHTML } from "./string-utils";

const closePolygon = (coordinates) => {
    let repairedPolygon = [...coordinates];
    if (
        coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
        coordinates[0][1] !== coordinates[coordinates.length - 1][1]
    ) {
        repairedPolygon.push(coordinates[0]);
    }
    return repairedPolygon;
};

const featureMatchesSong = (songName) => (feature) => {
    const featureSongName = decodeHTML(
        feature.properties.title.match(/>(.*?)</)[1]
    );
    return featureSongName === songName;
};

const calculateDistance = (point1, point2) => {
    const dx = point2[0] - point1[0];
    const dy = point2[1] - point1[1];
    return Math.sqrt(dx * dx + dy * dy);
}; // some basic euclidian mathematics

const getCenterOfPolygon = (points) => {
    const xSum = points.reduce((acc, [x, y]) => acc + x, 0);
    const ySum = points.reduce((acc, [x, y]) => acc + y, 0);
    return [xSum / points.length, ySum / points.length];
};

const getDistanceToPolygon = (point, polygon) => {
    const polygonLines = polygon.map((point, i) => [point, polygon[(i + 1) % polygon.length]]);
    const distances = polygonLines.map((line) => getDistanceToLine(point, line));
    return Math.min(...distances);
};

const getDistanceToLine = (point, line) => {
    let A = point[0] - line[0][0];
    let B = point[1] - line[0][1];
    let C = line[1][0] - line[0][0];
    let D = line[1][1] - line[0][1];

    let dot = A * C + B * D;
    let lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0)  // in case of 0 length line
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

    let dx = point[0] - xx;
    let dy = point[1] - yy;

    return Math.sqrt(dx * dx + dy * dy);
}

export { closePolygon, featureMatchesSong, calculateDistance, getCenterOfPolygon, getDistanceToPolygon }