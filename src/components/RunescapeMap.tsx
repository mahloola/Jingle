import L, { CRS, Icon } from 'leaflet';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  GeoJSON,
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import { MapLink } from '../data/map-links';
import { ClickedPosition, GameState, GameStatus } from '../types/jingle';
import { assertNotNil } from '../utils/assert';
import {
  convert,
  findNearestPolygonWhereSongPlays,
  switchLayer,
} from '../utils/map-utils';
import LayerPortals from './LayerPortals';

interface RunescapeMapProps {
  gameState: GameState;
  onNavigateBack?: () => void;
  onMapClick: (clickedPosition: ClickedPosition) => void;
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

function RunescapeMap({
  gameState,
  onMapClick,
  onNavigateBack,
}: RunescapeMapProps) {
  const map = useMap();
  const tileLayerRef = useRef<L.TileLayer>(null);
  const [currentMapId, setCurrentMapId] = useState(0);

  useEffect(() => {
    if (onNavigateBack) {
      const navigationEntry = gameState.navigationStack?.pop();
      switchLayer(map, tileLayerRef.current!, navigationEntry?.mapId || 0);
      map.panTo(
        [navigationEntry?.coordinates[0], navigationEntry?.coordinates[1]],
        { animate: false }
      );
      setCurrentMapId(navigationEntry?.mapId || 0);
    }
  });

  useMapEvents({
    click: async (e) => {
      if (gameState.status !== GameStatus.Guessing) return;
      const point = convert.ll_to_xy(e.latlng);
      onMapClick({ xy: point, mapId: currentMapId });
    },
  });

  const onGuessConfirmed = () => {
    assertNotNil(gameState.clickedPosition, 'gameState.clickedPosition');

    const song = gameState.songs[gameState.round];
    const { mapId, panTo } = findNearestPolygonWhereSongPlays(
      song,
      gameState.clickedPosition
    );
    if (currentMapId !== mapId) {
      switchLayer(map, tileLayerRef.current!, mapId);
    }
    map.panTo(convert.xy_to_ll(panTo));
    setCurrentMapId(mapId);
  };
  
  useEffect(() => {
    if (gameState.status === GameStatus.AnswerRevealed) {
      onGuessConfirmed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, gameState.status]);

  const showGuessMarker =
    ((gameState.status === GameStatus.Guessing && gameState.clickedPosition) ||
      gameState.status === GameStatus.AnswerRevealed) &&
    gameState.clickedPosition?.mapId === currentMapId;

  const { correctFeaturesData, correctMapId } = useMemo(() => {
    const song = gameState.songs[gameState.round];
    if (!map || !song || !gameState.clickedPosition) return {};

    const { featuresData, mapId } = findNearestPolygonWhereSongPlays(
      song,
      gameState.clickedPosition!
    );

    return { correctFeaturesData: featuresData, correctMapId: mapId };
  }, [map, gameState]);

    const showCorrectPolygon = 
    correctFeaturesData &&
    correctFeaturesData.some((featureData)=> {return featureData.mapId == currentMapId}) &&
    gameState.status === GameStatus.AnswerRevealed;

  // initially load the first tile layer
  useEffect(() => {
    setTimeout(() => {
      if (map && tileLayerRef.current) {
        switchLayer(map, tileLayerRef.current, currentMapId);
      }
    }, 0); // this waits until tileLayerRef is set (this is why i'm a senior dev)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPortalClick = (link: MapLink) => {
    if (link.start.mapId !== link.end.mapId) {
      switchLayer(map, tileLayerRef.current!, link.end.mapId);
    }
    map.panTo([link.end.y, link.end.x], { animate: false });
    gameState.onSurface = link.end.mapId === 0 ? true : false;
    
    setCurrentMapId(link.end.mapId);
  };

  return (
    <>
      {showGuessMarker && (
        <Marker
          position={convert.xy_to_ll(gameState.clickedPosition!.xy)}
          icon={
            new Icon({
              iconUrl: markerIconPng,
              iconSize: [25, 41],
              iconAnchor: [12, 41],
            })
          }
          interactive={false}
        />
      )}

      {showCorrectPolygon && (
        <GeoJSON
          key={currentMapId}
          data={correctFeaturesData.find((featureData)=>{return featureData.mapId === currentMapId})!.feature}
          style={() => ({
            color: '#0d6efd', // Outline color
            fillColor: '#0d6efd', // Fill color
            weight: 5, // Outline thickness
            fillOpacity: 0.5, // Opacity of fill
            transition: 'all 2000ms',
          })}
        />
      )}
      <LayerPortals currentmapId={currentMapId} onPortalClick={onPortalClick} />
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
