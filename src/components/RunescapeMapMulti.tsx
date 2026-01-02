import L, { CRS, Icon } from 'leaflet';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { GeoJSON, MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { CENTER_COORDINATES } from '../constants/defaults';
import { MapLink } from '../data/map-links';
import mapMetadata from '../data/map-metadata';
import '../style/uiBox.css';
import { ClickedPosition, MultiLobby, MultiLobbyStatus, NavigationState } from '../types/jingle';
import {
  calculateScoreFromPin,
  convert,
  findNearestPolygonWhereSongPlays,
  panMapToLinkPoint,
  recalculateNavigationStack,
  switchLayer,
} from '../utils/map-utils';
import LayerPortals from './LayerPortals';
import { Button } from './ui-util/Button';

interface RunescapeMapMultiProps {
  navigationState: NavigationState;
  multiLobby: MultiLobby;
  onMapClick: (clickedPosition: ClickedPosition) => void;
  GoBackButtonRef: React.RefObject<HTMLElement>;
}

export default function RunescapeMapMultiWrapper(props: RunescapeMapMultiProps) {
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
      <RunescapeMapMulti {...props} />
    </MapContainer>
  );
}

function RunescapeMapMulti({
  navigationState,
  multiLobby,
  onMapClick,
  GoBackButtonRef,
}: RunescapeMapMultiProps) {
  const map = useMap();
  const tileLayerRef = useRef<L.TileLayer>(null);
  const [currentMapId, setCurrentMapId] = useState(0);

  useMapEvents({
    click: async (e) => {
      if (multiLobby.gameState.status !== MultiLobbyStatus.Playing) return;
      const point = convert.ll_to_xy(e.latlng);
      onMapClick({ xy: point, mapId: currentMapId });
    },
  });

  const [isUnderground, setIsUnderground] = useState(false);

  const onGuessConfirmed = () => {
    const score = calculateScoreFromPin({
      song: multiLobby.gameState.currentRound.songName,
      pin: navigationState.clickedPosition,
    });
    // get current song and calculate position
    const song = multiLobby.gameState.currentRound?.songName;
    const { mapId, panTo } = findNearestPolygonWhereSongPlays(
      song,
      navigationState.clickedPosition,
    );

    // handle map layer switching if needed
    if (currentMapId !== mapId) {
      switchLayer(map, tileLayerRef.current!, mapId);
      recalculateNavigationStack(mapId, panTo, navigationState.navigationStack, setIsUnderground);
    }

    // update map position and state
    map.panTo(convert.xy_to_ll(panTo));

    setCurrentMapId(mapId);
  };

  useEffect(() => {
    if (multiLobby.gameState.status === MultiLobbyStatus.Revealing) {
      onGuessConfirmed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, multiLobby.gameState.status]);

  const showGuessMarker =
    ((multiLobby.gameState.status === MultiLobbyStatus.Playing &&
      navigationState.clickedPosition) ||
      multiLobby.gameState.status === MultiLobbyStatus.Revealing) &&
    navigationState.clickedPosition?.mapId === currentMapId;

  const { correctFeaturesData, correctMapId } = useMemo(() => {
    const song = multiLobby.gameState.currentRound?.songName;
    if (!map || !song || !navigationState.clickedPosition) return {};

    const { featuresData, mapId } = findNearestPolygonWhereSongPlays(
      song,
      navigationState.clickedPosition!,
    );

    return { correctFeaturesData: featuresData, correctMapId: mapId };
  }, [map, multiLobby.gameState]);

  const showCorrectPolygon =
    correctFeaturesData &&
    correctFeaturesData.some((featureData) => {
      return featureData.mapId == currentMapId;
    }) &&
    multiLobby.gameState.status === MultiLobbyStatus.Revealing;

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
    const { navigationStack } = navigationState;
    const lastNavEntry = navigationStack?.[navigationStack.length - 1];

    // handle case where we're returning to previous location
    if (end.mapId === lastNavEntry?.mapId) {
      navigationStack?.pop();
      switchLayer(map, tileLayerRef.current!, end.mapId);
      panMapToLinkPoint(map, end);
      setCurrentMapId(end.mapId);

      if (!navigationStack?.length) {
        setIsUnderground(false);
      }
      return;
    }

    // handle new location transition
    if (start.mapId !== end.mapId) {
      switchLayer(map, tileLayerRef.current!, end.mapId);
      navigationState.navigationStack?.push({
        mapId: start.mapId,
        coordinates: [start.y, start.x],
      });
    }

    panMapToLinkPoint(map, end);
    setCurrentMapId(end.mapId);
    setIsUnderground(true);
  };

  const handleGoBack = (e: React.MouseEvent<HTMLButtonElement>) => {
    const mostRecentNavEntry = navigationState.navigationStack?.pop();
    if (!mostRecentNavEntry) {
      console.warn('No navigation history to go back to');
      return;
    }
    const [x, y] = [mostRecentNavEntry?.coordinates[1], mostRecentNavEntry?.coordinates[0]];
    const mapId = mostRecentNavEntry?.mapId;
    const mapName = mapMetadata.find((mapData) => mapData.mapId == mapId)!.name;

    switchLayer(map, tileLayerRef.current!, mapId);
    panMapToLinkPoint(map, { x, y, mapId, name: mapName });
    setCurrentMapId(mapId);
    if (navigationState.navigationStack?.length === 0) {
      setIsUnderground(false);
    }
    e.stopPropagation();
  };

  return (
    <>
      {showGuessMarker && (
        <Marker
          position={convert.xy_to_ll(navigationState.clickedPosition!.xy)}
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
      {multiLobby.gameState.status === MultiLobbyStatus.Revealing &&
        multiLobby.gameState.currentRound.pins.map((pin) => {
          const player = multiLobby.players.find((player) => player.id === pin.userId);
          console.log(player?.avatarUrl);
          return (
            <Marker
              key={player?.id}
              position={convert.xy_to_ll(pin.details?.clickedPosition!.xy)}
              icon={
                new Icon({
                  iconUrl:
                    player?.avatarUrl ||
                    'https://i.pinimg.com/474x/18/b9/ff/18b9ffb2a8a791d50213a9d595c4dd52.jpg',
                  iconSize: [60, 60],
                  iconAnchor: [30, 60],
                })
              }
              interactive={false}
            />
          );
        })}
      {isUnderground &&
        GoBackButtonRef.current &&
        createPortal(
          <Button
            label='Go Back Up'
            onClick={(e) => handleGoBack(e)}
            classes='go-up-btn'
          />,
          GoBackButtonRef.current,
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
