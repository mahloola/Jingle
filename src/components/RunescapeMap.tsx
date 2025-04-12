import L, { CRS, Icon } from 'leaflet';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import 'leaflet/dist/leaflet.css';
import { RefObject, useEffect, useMemo, useRef } from 'react';
import {
  GeoJSON,
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import { GameState, GameStatus } from '../types/jingle';
import {
  findNearestPolygonWhereSongPlays,
  getCenterOfPolygon,
  leaflet_ll_to_leaflet_xy,
  leaflet_xy_to_leaflet_ll,
} from '../utils/map-utils';
const outerBounds = new L.LatLngBounds(L.latLng(-78, 0), L.latLng(0, 136.696));

interface RunescapeMapProps {
  gameState: GameState;
  onMapClick: (leaflet_ll_click: L.LatLng) => void;
}

export default function RunescapeMapWrapper({
  mapRef,
  ...props
}: RunescapeMapProps & { mapRef: RefObject<L.Map | null> }) {
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
      onMapClick(e.latlng);
    },
  });

  // pan to center of correct polygon
  useEffect(() => {
    if (gameState.status === GameStatus.AnswerRevealed) {
      const song = gameState.songs[gameState.round];
      const { polygon } = findNearestPolygonWhereSongPlays(
        map,
        song,
        gameState.leaflet_ll_click!,
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
    (gameState.status === GameStatus.Guessing && gameState.leaflet_ll_click) ||
    gameState.status === GameStatus.AnswerRevealed;

  const song = gameState.songs[gameState.round];
  const leaflet_ll_click = gameState.leaflet_ll_click;
  const correctPolygon = useMemo(() => {
    if (!map || !song || !leaflet_ll_click) return undefined;

    const { polygon } = findNearestPolygonWhereSongPlays(
      map,
      song,
      leaflet_ll_click!,
    );
    return polygon;
  }, [map, song, leaflet_ll_click]);

  return (
    <>
      {showGuessMarker && (
        <Marker
          position={gameState.leaflet_ll_click!}
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
          data={correctPolygon!}
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
