import React, { useState, useEffect } from "react";
import { Marker, useMapEvents, GeoJSON } from "react-leaflet";
import { Icon } from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import { polygon, booleanPointInPolygon } from "@turf/turf";
import geojsondata from "./data/GeoJSON";
import { toOurPixelCoordinates } from "./utils/coordinate-utils";
import {
  featureMatchesSong,
  calculateDistance,
  getCenterOfPolygon,
  closePolygon,
} from "./utils/clickHandler-utils";
import {
  incrementGlobalGuessCounter,
  incrementSongFailureCount,
  incrementSongSuccessCount,
} from "./db/db";

let resultTimeout = null;

export const MapClickHandler = ({ currentSong, setGuessResult, setResultVisible, setDailyResults, dailyResults, dailyChallengeIndex, setDailyComplete }) => {
  const [position, setPosition] = useState(null);
  const [correctPolygon, setCorrectPolygon] = useState(null);
  let zoom = 0;
  let geojsonFeature;
  let center;
  const userGuessed = (geojsonFeature, center, zoom, setResultVisible, setCorrectPolygon, map) => {
    setResultVisible(true);
    setCorrectPolygon(geojsonFeature);
    map.panTo(center, zoom);
  };

  useEffect(() => {
    if (correctPolygon) {
      // Clear the correct polygon after 2 seconds
      const timeout = setTimeout(() => {
        setCorrectPolygon(null);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [correctPolygon]);

  const hideResultAfterMs = (ms) => {
    clearTimeout(resultTimeout);
    resultTimeout = setTimeout(() => setResultVisible(false), ms);
  };

  const calculatePoints = (distance) => (1000 * 1) / Math.exp(0.0018 * distance);

  const map = useMapEvents({
    click: (e) => {
      incrementGlobalGuessCounter();
      setPosition(e.latlng);

      zoom = map.getMaxZoom();
      const { x, y } = map.project(e.latlng, zoom);
      const ourPixelCoordsClickedPoint = [x, y];

      const clickedFeatures = geojsondata.features.filter((feature) =>
        feature.geometry.coordinates.some((poly) => {
          const transformedPoly = polygon([closePolygon(poly.map(toOurPixelCoordinates))]);
          return booleanPointInPolygon(ourPixelCoordsClickedPoint, transformedPoly);
        })
      );
      const correctFeature = geojsondata.features.find(featureMatchesSong(currentSong));
      const correctClickedFeature = clickedFeatures.find(featureMatchesSong(currentSong));
      const dailyResultsTemp = dailyResults;
      dailyResults.length > 3 ? setDailyComplete(true) : setDailyComplete(false);
      if (correctClickedFeature) {
        setGuessResult(1000);
        dailyResultsTemp[dailyChallengeIndex] = (1000);
        setDailyResults(dailyResultsTemp);
        incrementSongSuccessCount(currentSong);
        setResultVisible(true);
        hideResultAfterMs(2000);
      } else {
        incrementSongFailureCount(currentSong);
        const correctPolygonCenterPoints = correctFeature.geometry.coordinates.map((polygon) =>
          getCenterOfPolygon(polygon.map(toOurPixelCoordinates))
        );
        const distances = correctPolygonCenterPoints.map((point) =>
          calculateDistance(ourPixelCoordsClickedPoint, point)
        );
        const minDistance = Math.min(...distances);
        setGuessResult(Math.round(calculatePoints(minDistance)));    
        dailyResultsTemp[dailyChallengeIndex] = Math.round(calculatePoints(minDistance));
        setDailyResults(dailyResultsTemp);
        hideResultAfterMs(2000);
      }

      // Create a GeoJSON feature for the nearest correct polygon
      const correctPolygon = correctFeature.geometry.coordinates.sort((polygon1, polygon2) => {
        const c1 = getCenterOfPolygon(polygon1.map(toOurPixelCoordinates));
        const c2 = getCenterOfPolygon(polygon2.map(toOurPixelCoordinates));
        const d1 = calculateDistance(ourPixelCoordsClickedPoint, c1);
        const d2 = calculateDistance(ourPixelCoordsClickedPoint, c2);
        return d1 - d2;
      })[0];
      const convertedCoordinates = correctPolygon // 1. their pixel coords
        .map(toOurPixelCoordinates) // 2. our pixel coords
        .map((coordinate) => map.unproject(coordinate, zoom)) // 3. leaflet { latlng }
        .map(({ lat, lng }) => [lng, lat]); // 4. leaflet [ latlng ]
      geojsonFeature = {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [convertedCoordinates],
        },
      };

      center = map.unproject(
        getCenterOfPolygon(
          correctPolygon // 1. their pixel coords
            .map(toOurPixelCoordinates) // 2. our pixel coords
        ),
        zoom
      );
      userGuessed(geojsonFeature, center, zoom, setResultVisible, setCorrectPolygon, map);
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