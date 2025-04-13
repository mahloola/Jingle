import L, { CRS, Icon } from 'leaflet';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import 'leaflet/dist/leaflet.css';
import { RefObject, useEffect, useMemo, useRef, useState } from 'react';
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
  convert,
  featureMatchesSong,
  findNearestPolygonWhereSongPlays,
  getCenterOfPolygon,
  switchLayer,
} from '../utils/map-utils';
import LayerPortals from './LayerPortals';
import { MapLink } from '../data/map-links';
import geojsondata from '../data/GeoJSON';
import { assocPath } from 'ramda';
import { Position } from 'geojson';

interface RunescapeMapProps {
  gameState: GameState;
  onMapClick: (clickedPosition: Position) => void;
}

export default function RunescapeMapWrapper(props: RunescapeMapProps) {
  return (
    <MapContainer
      center={[3222, 3218]} // lumbridge
      zoom={1}
      minZoom={0}
      maxZoom={3}
      style={{ height: '100dvh', width: '100%', backgroundColor: 'black' }}
      maxBoundsViscosity={0.5}
      crs={CRS.Simple}
    >
      <RunescapeMap {...props} />
    </MapContainer>
  );
}

function RunescapeMap({ gameState, onMapClick }: RunescapeMapProps) {
  const map = useMap();

  useMapEvents({
    click: async (e) => {
      if (gameState.status !== GameStatus.Guessing) return;
      onMapClick(convert.ll_to_xy(e.latlng));
    },
  });

  // pan to center of correct polygon
  useEffect(() => {
    if (gameState.status === GameStatus.AnswerRevealed) {
      const song = gameState.songs[gameState.round];
      const { polygon } = findNearestPolygonWhereSongPlays(
        song,
        gameState.clickedPosition!,
      );

      const center = getCenterOfPolygon(polygon.geometry.coordinates[0]);
      map.panTo(convert.xy_to_ll(center));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, gameState.status]);

  const showGuessMarker =
    (gameState.status === GameStatus.Guessing && gameState.clickedPosition) ||
    gameState.status === GameStatus.AnswerRevealed;

  const song = gameState.songs[gameState.round];
  const clickedPosition = gameState.clickedPosition;
  const correctPolygon = useMemo(() => {
    if (!map || !song || !clickedPosition) return undefined;

    const { polygon } = findNearestPolygonWhereSongPlays(
      song,
      clickedPosition!,
    );
    return polygon;
  }, [map, song, clickedPosition]);

  // #region map layers
  const tileLayerRef = useRef<L.TileLayer>(null);
  const [currentmapId, setCurrentmapId] = useState(0);

  // initally set the map to the first layer. subsequent
  useEffect(() => {
    setTimeout(() => {
      if (map && tileLayerRef.current) {
        switchLayer(map, tileLayerRef.current, currentmapId);
      }
    }, 0); // this waits until tileLayerRef is set (this is why i'm a senior dev)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPortalClick = (link: MapLink) => {
    if (link.start.mapId !== link.end.mapId) {
      switchLayer(map, tileLayerRef.current!, link.end.mapId);
    }
    map.panTo([link.end.y, link.end.x], { animate: false });
    setCurrentmapId(link.end.mapId);
  };
  // #endregion map layers

  return (
    <>
      {showGuessMarker && (
        <Marker
          position={convert.xy_to_ll(gameState.clickedPosition!)}
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
      <LayerPortals currentmapId={currentmapId} onPortalClick={onPortalClick} />
      <TileLayer
        ref={tileLayerRef}
        url='placeholder' // set by switchLayer
        minZoom={-1}
        maxZoom={3}
        maxNativeZoom={2}
        tileSize={256}
      />
    </>
  );
}
