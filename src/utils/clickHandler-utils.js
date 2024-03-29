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

export { closePolygon, featureMatchesSong, calculateDistance, getCenterOfPolygon }