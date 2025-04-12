import L, { CRS, Icon } from 'leaflet';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import {
  GeoJSON,
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import { GameState, GameStatus, Guess } from '../types/jingle';
import {
  findNearestPolygonWhereSongPlays,
  getCenterOfPolygon,
  leaflet_ll_to_leaflet_xy,
  leaflet_xy_to_leaflet_ll,
} from '../utils/map-utils';
const outerBounds = new L.LatLngBounds(L.latLng(-78, 0), L.latLng(0, 136.696));

interface RunescapeMapProps {
  gameState: GameState;
  onMapClick: (guess: Guess) => void;
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
      style={{ height: '100dvh', width: '100%' }}
      maxBounds={outerBounds}
      maxBoundsViscosity={1}
      crs={CRS.Simple}
      className={className}
    >
      <RunescapeMap {...props} />
      <TileLayer attribution='offline' url={`/rsmap-tiles/{z}/{x}/{y}.png`} />
    </MapContainer>
  );
}

function RunescapeMap({ gameState, onMapClick }: RunescapeMapProps) {
  const map = useMap();

  useMapEvents({
    click: async (e) => {
      if (gameState.status !== GameStatus.Guessing) return;

      const song = gameState.songs[gameState.round];
      const leaflet_ll_click = e.latlng;
      const { polygon, distance } = findNearestPolygonWhereSongPlays(
        map,
        song,
        leaflet_ll_click,
      );

      onMapClick({
        correct: distance === 0,
        distance: distance,
        guessedPosition: leaflet_ll_click,
        correctPolygon: polygon,
      });
    },
  });

  // pan to center of correct polygon
  useEffect(() => {
    if (gameState.status === GameStatus.AnswerRevealed) {
      const song = gameState.songs[gameState.round];
      const { polygon } = findNearestPolygonWhereSongPlays(
        map,
        song,
        gameState.guess!.guessedPosition,
      );

      const leaflet_ll_correctPolygon = polygon.geometry.coordinates[0];
      const leaflet_xy_correctPolygon = leaflet_ll_correctPolygon
        .map(([lng, lat]) => new L.LatLng(lat, lng))
        .map((ll) => leaflet_ll_to_leaflet_xy(map, ll));
      const leaflet_xy_centerOfCorrectPolygon = getCenterOfPolygon(
        leaflet_xy_correctPolygon,
      );
      const leaflet_ll_centerOfCorrectPolygon = leaflet_xy_to_leaflet_ll(
        map,
        leaflet_xy_centerOfCorrectPolygon,
      );
      map.panTo(leaflet_ll_centerOfCorrectPolygon);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, gameState.status]);

  const showGuessMarker =
    (gameState.status === GameStatus.Guessing && gameState.guess) ||
    gameState.status === GameStatus.AnswerRevealed;

  return (
    <>
      {showGuessMarker && (
        <Marker
          position={gameState.guess!.guessedPosition}
          icon={
            new Icon({
              iconUrl: markerIconPng,
              iconSize: [25, 41],
              iconAnchor: [12, 41],
            })
          }
        />
      )}

      {gameState.status === GameStatus.AnswerRevealed && (
        <GeoJSON
          data={gameState.guess!.correctPolygon}
          style={() => ({
            color: '#0d6efd', // Outline color
            fillColor: '#0d6efd', // Fill color
            weight: 5, // Outline thickness
            fillOpacity: 0.5, // Opacity of fill
            transition: 'all 2000ms',
          })}
        />
      )}
      <TileLayer attribution='offline' url={`/rsmap-tiles/{z}/{x}/{y}.png`} />
    </>
  );
}
