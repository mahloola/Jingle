import React, { useState, useEffect } from "react";
import { Marker, useMapEvents, GeoJSON } from "react-leaflet";
import { Icon, point } from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import { polygon, booleanPointInPolygon } from "@turf/turf";
import geojsondata from "./data/GeoJSON";

export const MapClickHandler = ({
  currentSong,
  guessResult,
  setGuessResult,
}) => {
  const [position, setPosition] = useState(null);
  const [correctPolygon, setCorrectPolygon] = useState(null);

  useEffect(() => {
    if (correctPolygon) {
      // Clear the correct polygon after 2 seconds
      const timeout = setTimeout(() => {
        setCorrectPolygon(null);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [correctPolygon]);

  const map = useMapEvents({
    click: (e) => {
      setPosition(e.latlng);
      const zoom = map.getMaxZoom();
      const clickedPointPixels = map.project(e.latlng, zoom);
      for (const feature of geojsondata.features) {
        const songNameString = feature.properties.title;
        const contentInsideTags = songNameString.match(/>(.*?)</);
        const result = contentInsideTags ? contentInsideTags[1] : null;
        if (result === currentSong) {
          const scaleFactor = 3;
          const adjustedCoordinates = ([x, y]) => [
            x * scaleFactor - 3108,
            -(y * scaleFactor) + 12450,
          ];
          for (let i = 0; i < feature.geometry.coordinates.length; i++) {
            const coordinates =
              feature.geometry.coordinates[i].map(adjustedCoordinates);
            if (
              coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
              coordinates[0][1] !== coordinates[coordinates.length - 1][1]
            ) {
              coordinates.push(coordinates[0]);
            }
            const poly = polygon([coordinates]);

            const clickedPoint = [
              clickedPointPixels.x.toFixed(0),
              clickedPointPixels.y.toFixed(0),
            ];

            // find the middle point of the polygon
            const currentCoordinates = poly.geometry.coordinates[0];
            const xSum = currentCoordinates.reduce((acc, val) => acc + val[0], 0);
            const ySum = currentCoordinates.reduce((acc, val) => acc + val[1], 0);
            const correctPolygonPoint = [
              xSum / currentCoordinates.length,
              ySum / currentCoordinates.length,
            ];

            const calculateDistance = (point1, point2) => {
              const dx = point2[0] - point1[0];
              const dy = point2[1] - point1[1];
              return Math.sqrt(dx * dx + dy * dy);
            }; // some basic euclidian mathematics

            const distanceToNearestPoint = calculateDistance(
              clickedPoint,
              correctPolygonPoint
            );
            setGuessResult(distanceToNearestPoint);
            if (booleanPointInPolygon(clickedPoint, poly)) {
              setGuessResult(1000);
              break;
            } else {
              const score = ((10000 - distanceToNearestPoint) / 10).toFixed(0);
              setGuessResult(score);
              const pointCorrectPolygonPoint = new point(
                correctPolygonPoint[0],
                correctPolygonPoint[1]
              );
              const unprojected = map.unproject(pointCorrectPolygonPoint, zoom);
              map.panTo(unprojected, zoom);

              const unprojectedCoordinates = [];
              for (const coordinate of coordinates) {
                unprojectedCoordinates.push(map.unproject(coordinate, zoom));
              }
              const convertedCoordinates = unprojectedCoordinates.map(({ lat, lng }) => [lng, lat]);
              // Create a GeoJSON feature for the correct polygon
              const geojsonFeature = {
                type: "Feature",
                geometry: {
                  type: "Polygon",
                  coordinates: [convertedCoordinates],
                },
              };
              setCorrectPolygon(geojsonFeature);
              break;
            }
          }
        }
      }
    },
  });

  return (
    <>
      {position && (
        <Marker
          position={position}
          icon={
            new Icon({
              iconUrl: markerIconPng,
              iconSize: [25, 41],
              iconAnchor: [12, 41],
            })
          }
        />
      )}
      {correctPolygon && (
        <GeoJSON
          data={correctPolygon}
          style={() => ({
            color: "#0d6efd", // Outline color
            fillColor: "#0d6efd", // Fill color
            weight: 5, // Outline thickness
            fillOpacity: 0.5, // Opacity of fill
            transition: "opacity 3s",
            animation: "fade-out 3s",
          })}
        />
      )}
    </>
  );
};

export default MapClickHandler;
