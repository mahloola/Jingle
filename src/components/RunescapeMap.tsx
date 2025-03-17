import { useRef } from "react";
import L, { CRS, Icon } from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import "leaflet/dist/leaflet.css";
import { GeoJSON, Marker, MapContainer, TileLayer } from "react-leaflet";
import { booleanPointInPolygon, polygon } from "@turf/turf";
import { useMapEvents } from "react-leaflet";
import geojsondata from "../data/GeoJSON";
import {
  calculateDistance,
  closePolygon,
  featureMatchesSong,
  getCenterOfPolygon,
  toOurPixelCoordinates,
} from "../utils/map-utils";
import { GameState, GameStatus } from "../types/jingle";
import { Point } from "../types/geometry";
import { GeoJsonObject } from "geojson";
import { Guess } from "../hooks/useGameLogic";

const outerBounds = new L.LatLngBounds(L.latLng(-78, 0), L.latLng(0, 136.696));

interface RunescapeMapProps {
  gameState: GameState;
  onGuess: (guess: Guess) => void;
  className?: string;
}

export default function RunescapeMapWrapper({
  className,
  ...props
}: RunescapeMapProps) {
  const mapRef = useRef<L.Map>(null);
  return (
    <MapContainer
      ref={mapRef}
      center={[-35, 92.73]}
      zoom={5}
      maxZoom={6}
      minZoom={4}
      style={{ height: "100vh", width: "100%" }}
      maxBounds={outerBounds}
      maxBoundsViscosity={1}
      crs={CRS.Simple}
      className={className}
    >
      <RunescapeMap {...props} />
      <TileLayer attribution="offline" url={`/rsmap-tiles/{z}/{x}/{y}.png`} />
    </MapContainer>
  );
}

function RunescapeMap({ gameState, onGuess }: RunescapeMapProps) {
  const currentSong = gameState.songs[gameState.round];

  const map = useMapEvents({
    click: async (e) => {
      if (gameState.status !== GameStatus.Guessing) return;

      const zoom = map.getMaxZoom();
      const { x, y } = map.project(e.latlng, zoom);
      const ourPixelCoordsClickedPoint = [x, y] as Point;

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
      )!;
      const correctClickedFeature = clickedFeatures.find(
        featureMatchesSong(currentSong),
      )!;

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
      const correctPolygonData = {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [convertedCoordinates],
        },
      } as GeoJsonObject;

      if (correctClickedFeature) {
        onGuess({
          correct: true,
          distance: 0,
          guessedPosition: e.latlng,
          correctPolygon: correctPolygonData,
        });
      } else {
        const correctPolygonCenterPoints =
          correctFeature.geometry.coordinates.map((polygon) =>
            getCenterOfPolygon(polygon.map(toOurPixelCoordinates)),
          );
        const distances = correctPolygonCenterPoints.map((point) =>
          calculateDistance(ourPixelCoordsClickedPoint, point as Point),
        );
        const closestDistance = Math.min(...distances);
        onGuess({
          correct: false,
          distance: closestDistance,
          guessedPosition: e.latlng,
          correctPolygon: correctPolygonData,
        });
      }

      map.panTo(
        map.unproject(
          getCenterOfPolygon(
            correctPolygon // 1. their pixel coords
              .map(toOurPixelCoordinates), // 2. our pixel coords
          ),
          zoom,
        ),
      );
    },
  });

  return (
    <>
      {gameState.status === GameStatus.AnswerRevealed && (
        <>
          <Marker
            position={gameState.guessedPosition!}
            icon={
              new Icon({
                iconUrl: markerIconPng,
                iconSize: [25, 41],
                iconAnchor: [12, 41],
              })
            }
          />

          <GeoJSON
            data={gameState.correctPolygon!}
            style={() => ({
              color: "#0d6efd", // Outline color
              fillColor: "#0d6efd", // Fill color
              weight: 5, // Outline thickness
              fillOpacity: 0.5, // Opacity of fill
              transition: "all 2000ms",
            })}
          />
        </>
      )}
      <TileLayer attribution="offline" url={`/rsmap-tiles/{z}/{x}/{y}.png`} />
    </>
  );
}
