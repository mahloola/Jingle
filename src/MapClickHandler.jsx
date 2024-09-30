import { booleanPointInPolygon, polygon } from '@turf/turf';
import { Icon } from 'leaflet';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import React, { useState } from 'react';
import { GeoJSON, Marker, useMapEvents } from 'react-leaflet';
import geojsondata from './data/GeoJSON';
import {
  calculateDailyChallengePercentile,
  getDailyChallengePercentileAndIncrement,
  getDailyChallengeResults,
  incrementDailyChallenge,
  incrementGlobalGuessCounter,
  incrementSongFailureCount,
  incrementSongSuccessCount,
} from './db/db';
import { calculateTimeDifference } from './utils/calculateTimeDifference';
import {
  calculateDistance,
  closePolygon,
  featureMatchesSong,
  getCenterOfPolygon,
  getDistanceToPolygon,
} from './utils/clickHandler-utils';
import { toOurPixelCoordinates } from './utils/coordinate-utils';
import getCurrentDateInBritain from './utils/getCurrentDateinBritain';

export const MapClickHandler = ({
  setCorrectPolygon,
  correctPolygon,
  currentSong,
  setGuessResult,
  resultVisible,
  setResultVisible,
  setResultsArray,
  resultsArray,
  dailyChallengeIndex,
  setDailyComplete,
  startedGame,
  setCurrentSongUi,
  setPercentile,
  startTime,
  setTimeTaken,
  totalDailyResults
}) => {
  const [position, setPosition] = useState(null);
  let zoom = 0;
  let geojsonFeature;
  let center;
  const userGuessed = (
    geojsonFeature,
    center,
    zoom,
    setResultVisible,
    setCorrectPolygon,
    map,
  ) => {
    setResultVisible(true);
    setCorrectPolygon(geojsonFeature);
    map.panTo(center, zoom);
    setCurrentSongUi(currentSong);
  };

  const calculatePoints = (distance) =>
    (1000 * 1) / Math.exp(0.0018 * distance);

  const map = useMapEvents({
    click: async (e) => {
      if (resultVisible || !startedGame) {
        return;
      }
      incrementGlobalGuessCounter();
      setPosition(e.latlng);

      zoom = map.getMaxZoom();
      const { x, y } = map.project(e.latlng, zoom);
      const ourPixelCoordsClickedPoint = [x, y];

      const clickedFeatures = geojsondata.features.filter((feature) =>
        feature.geometry.coordinates.some((poly) => {
          const transformedPoly = polygon([
            closePolygon(poly.map(toOurPixelCoordinates)),
          ]);
          return booleanPointInPolygon(
            ourPixelCoordsClickedPoint,
            transformedPoly,
          );
        }),
      );
      const correctFeature = geojsondata.features.find(
        featureMatchesSong(currentSong),
      );
      const correctClickedFeature = clickedFeatures.find(
        featureMatchesSong(currentSong),
      );
      const resultsArrayTemp = resultsArray;

      if (correctClickedFeature) {
        setGuessResult(1000);
        resultsArrayTemp[dailyChallengeIndex] = 1000;
        setResultsArray(resultsArrayTemp);
        incrementSongSuccessCount(currentSong);
        setResultVisible(true);
        localStorage.setItem('dailyResults', JSON.stringify(resultsArray));
      } else {
        incrementSongFailureCount(currentSong);
        const distanceToPolygon = Math.min(
            ...correctFeature.geometry.coordinates.map((polygon) =>
                getDistanceToPolygon(ourPixelCoordsClickedPoint, polygon.map(toOurPixelCoordinates))));
        const points = Math.round(calculatePoints(distanceToPolygon));
        setGuessResult(points);
        resultsArrayTemp[dailyChallengeIndex] = points;
        setResultsArray(resultsArrayTemp);
        localStorage.setItem('dailyResults', JSON.stringify(resultsArray));
      }
      if (resultsArray.length > 4) {
        setTimeTaken(calculateTimeDifference(startTime, new Date()));
        setTimeout(() => setDailyComplete(true), 1500);
        if (
          localStorage?.dailyComplete === undefined ||
          localStorage?.dailyComplete !== getCurrentDateInBritain()
        ) {
          const dailyComplete = getCurrentDateInBritain();
          localStorage.setItem('dailyComplete', dailyComplete);
          localStorage.setItem(
            'dailyTimeTaken',
            calculateTimeDifference(startTime, new Date()),
          );
          const dailyResultTotal = resultsArray.reduce(
            (total, result) => total + result,
            0,
          );
          const percentile = calculateDailyChallengePercentile(totalDailyResults, dailyResultTotal);
          // const percentile = await getDailyChallengePercentileAndIncrement(
          //   dailyResultTotal ?? 0,
          // );
          incrementDailyChallenge(dailyResultTotal);
          setPercentile(percentile);
        }
      } else {
        setDailyComplete(false);
      }
      // Create a GeoJSON feature for the nearest correct polygon
      const correctPolygon = correctFeature.geometry.coordinates.sort(
        (polygon1, polygon2) => {
          const c1 = getCenterOfPolygon(polygon1.map(toOurPixelCoordinates));
          const c2 = getCenterOfPolygon(polygon2.map(toOurPixelCoordinates));
          const d1 = calculateDistance(ourPixelCoordsClickedPoint, c1);
          const d2 = calculateDistance(ourPixelCoordsClickedPoint, c2);
          return d1 - d2;
        },
      )[0];
      const convertedCoordinates = correctPolygon // 1. their pixel coords
        .map(toOurPixelCoordinates) // 2. our pixel coords
        .map((coordinate) => map.unproject(coordinate, zoom)) // 3. leaflet { latlng }
        .map(({ lat, lng }) => [lng, lat]); // 4. leaflet [ latlng ]
      geojsonFeature = {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [convertedCoordinates],
        },
      };

      center = map.unproject(
        getCenterOfPolygon(
          correctPolygon // 1. their pixel coords
            .map(toOurPixelCoordinates), // 2. our pixel coords
        ),
        zoom,
      );
      userGuessed(
        geojsonFeature,
        center,
        zoom,
        setResultVisible,
        setCorrectPolygon,
        map,
      );
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
            color: '#0d6efd', // Outline color
            fillColor: '#0d6efd', // Fill color
            weight: 5, // Outline thickness
            fillOpacity: 0.5, // Opacity of fill
            opacity: correctPolygon == null ? 0 : 1, // Opacity of outline
            transition: 'all 2000ms',
          })}
        />
      )}
    </>
  );
};

export default MapClickHandler;
