import L, { CRS, Icon } from 'leaflet';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { GeoJSON, MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { CENTER_COORDINATES } from '../constants/defaults';
import { MapLink } from '../data/map-links';
import '../style/uiBox.css';
import { ClickedPosition, GameState, GameStatus } from '../types/jingle';
import { assertNotNil } from '../utils/assert';
import {
  convert,
  findNearestPolygonWhereSongPlays,
  handleNavigationStackUpdate,
  switchLayer,
} from '../utils/map-utils';
import LayerPortals from './LayerPortals';
import { Button } from './ui-util/Button';

interface RunescapeMapProps {
  gameState: GameState;
  onMapClick: (clickedPosition: ClickedPosition) => void;
}

export default function RunescapeMapWrapper(props: RunescapeMapProps) {
  return (
    <MapContainer
      center={CENTER_COORDINATES} // lumbridge
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
  const tileLayerRef = useRef<L.TileLayer>(null);
  const [currentMapId, setCurrentMapId] = useState(0);

  useMapEvents({
    click: async (e) => {
      if (gameState.status !== GameStatus.Guessing) return;
      const point = convert.ll_to_xy(e.latlng);
      onMapClick({ xy: point, mapId: currentMapId });
    },
  });

  const [isUnderground, setIsUnderground] = useState(false);

  const onGuessConfirmed = () => {
    assertNotNil(gameState.clickedPosition, 'gameState.clickedPosition');

    // get current song and calculate position
    const song = gameState.songs[gameState.round];
    const { mapId, panTo } = findNearestPolygonWhereSongPlays(song, gameState.clickedPosition);

    // handle map layer switching if needed
    if (currentMapId !== mapId) {
      switchLayer(map, tileLayerRef.current!, mapId);
      handleNavigationStackUpdate(mapId, currentMapId, gameState.navigationStack, setIsUnderground);
    }

    // update map position and state
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
      gameState.clickedPosition!,
    );

    return { correctFeaturesData: featuresData, correctMapId: mapId };
  }, [map, gameState]);

  const showCorrectPolygon =
    correctFeaturesData &&
    correctFeaturesData.some((featureData) => {
      return featureData.mapId == currentMapId;
    }) &&
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
    const { start, end } = link;
    const { navigationStack } = gameState;
    const lastNavEntry = navigationStack?.[navigationStack.length - 1];

    // handle case where we're returning to previous location
    if (end.mapId === lastNavEntry?.mapId) {
      navigationStack?.pop();
      switchLayer(map, tileLayerRef.current!, end.mapId);
      map.panTo([end.y, end.x], { animate: false });
      setCurrentMapId(end.mapId);

      if (!navigationStack?.length) {
        setIsUnderground(false);
      }
      return;
    }

    // handle new location transition
    if (start.mapId !== end.mapId) {
      switchLayer(map, tileLayerRef.current!, end.mapId);
      gameState.navigationStack?.push({
        mapId: start.mapId,
        coordinates: [start.y, start.x],
      });
    }

    map.panTo([end.y, end.x], { animate: false });
    setCurrentMapId(end.mapId);
    setIsUnderground(true);
  };

  const handleGoBack = () => {
    const mostRecentNavEntry = gameState.navigationStack?.pop();
    if (!mostRecentNavEntry) {
      console.warn('No navigation history to go back to');
      return;
    }
    const [x, y] = [mostRecentNavEntry?.coordinates[1], mostRecentNavEntry?.coordinates[0]];
    const mapId = mostRecentNavEntry?.mapId;
    switchLayer(map, tileLayerRef.current!, mapId);
    map.panTo([y, x], { animate: false });
    setCurrentMapId(mapId);
    if (gameState.navigationStack?.length === 0) {
      setIsUnderground(false);
    }
  };

  return (
    <>
      {isUnderground && (
        <div className='above-map'>
          <Button
            label='Go Back Up'
            onClick={handleGoBack}
          />
        </div>
      )}
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
          data={
            correctFeaturesData.find((featureData) => {
              return featureData.mapId === currentMapId;
            })!.feature
          }
          style={() => ({
            color: '#0d6efd', // Outline color
            fillColor: '#0d6efd', // Fill color
            weight: 5, // Outline thickness
            fillOpacity: 0.5, // Opacity of fill
            transition: 'all 2000ms',
          })}
        />
      )}
      <LayerPortals
        currentmapId={currentMapId}
        onPortalClick={onPortalClick}
      />
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
