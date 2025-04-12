import { booleanContains, booleanPointInPolygon, polygon } from '@turf/turf';
import { Feature, Polygon } from 'geojson';
import L, { CRS, Icon } from 'leaflet';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import {
  GeoJSON,
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import geojsondata from '../data/GeoJSON';
import { Point } from '../types/geometry';
import { GameState, GameStatus, Guess } from '../types/jingle';
import {
  calculateDistance,
  closePolygon,
  featureMatchesSong,
  getCenterOfPolygon,
  getDistanceToPolygon,
  toOurPixelCoordinates,
} from '../utils/map-utils';
import { 
   ConfigureNearestNeighbor,
   HandleMapZoom, 
   InternalMapState
} from '../utils/map-config';
import basemaps from '../data/basemaps';
import { groupedLinks } from '../data/GroupedLinks';
import LinkClickboxes from './LinkClickboxes';
import CustomTileLayer from './CustomTileLayer';

interface RunescapeMapProps {
  gameState: GameState;
  onMapClick: (guess: Guess) => void;
  className?: string;
}

const mapIdPadding = 256; //in game tiles


export default function RunescapeMapWrapper({
  className,
  ...props
}: RunescapeMapProps) {
  const mapRef = useRef<L.Map>(null);

  //map state 
  const [currentMapId, setCurrentMapId] = useState(0);
  const [zoom, setZoom] = useState(1); 
  const [mapCenter, setMapCenter] = useState([3222, 3218]); //lumby
  const [markerState, setMarkerState] = useState({
    markerPosition: null as L.LatLng | null,
    markerMapId: 0,
  });

  const currentMap = basemaps[currentMapId];
  return (
    <MapContainer
      ref={mapRef}
      key={currentMapId} 
      center={[mapCenter[1], mapCenter[0]]}
      zoom={zoom}
      maxZoom={3}
      minZoom={0}
      style={{ height: '100dvh', width: '100%', background: "black" }}
      maxBoundsViscosity={0.5} //necessary for smooth dungeon...eering experience.
      crs={CRS.Simple}
      className={className}
      maxBounds={[
        [currentMap.bounds[0][1] - mapIdPadding, currentMap.bounds[0][0] - mapIdPadding],                                     
        [currentMap.bounds[1][1] + mapIdPadding, currentMap.bounds[1][0] + mapIdPadding],
      ]}
    >
      <CustomTileLayer currentMapId={currentMapId}/>
      <RunescapeMap 
        {...props} 
        setMapCenter={setMapCenter} 
        zoom={zoom} setZoom={setZoom} 
        markerState={markerState} setMarkerState={setMarkerState}
        currentMapId={currentMapId} setCurrentMapId={setCurrentMapId}  
      />
    </MapContainer>
  );
}

function RunescapeMap({ 
    gameState, onMapClick, 
    currentMapId, setCurrentMapId, 
    markerState, setMarkerState,
    zoom, setZoom,
    setMapCenter
}: InternalMapState
) {
  const map = useMap();
  const currentMap = basemaps[currentMapId];

  //trigger. better solutions?
  const linkClick = useRef(false); 

  //map links
  const linksData = {
    mapIdLinks: groupedLinks[currentMap.name],
    setCurrentMapId: setCurrentMapId,
    setMapCenter: setMapCenter,
    linkClick: linkClick,
    map: map,
  }

  //override map zoom, to not reset when changing mapIds
  useEffect(()=>{
    HandleMapZoom(map, setZoom);
  },[zoom])
 
  useMapEvents({
    click: async (e) => {
      if (gameState.status !== GameStatus.Guessing) {
        return;
      }

      //maplink consume click event
      if(linkClick.current){
        linkClick.current = false; 
        return; 
      } 

      const markerPosition = e.latlng;
      const zoom = map.getMaxZoom();
      const { x, y } = map.project(markerPosition, zoom);
      const ourPixelCoordsClickedPoint = [x, y] as Point;

      const currentSong = gameState.songs[gameState.round];
      const correctFeature = geojsondata.features.find(
        featureMatchesSong(currentSong),
      )!;

      //all closed polys for current song
      const repairedPolygons =
        correctFeature.geometry.coordinates.map(closePolygon);

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

      //if closest correct polgy is a gap, set outerPolygon to the actual parent poly, else iteself.
      const repairedCorrectPolygon = closePolygon(correctPolygon);

      const outerPolygon =
        repairedPolygons.find((repairedPolygon) => {
          if (
            JSON.stringify(repairedPolygon) !==
            JSON.stringify(repairedCorrectPolygon)
          ) {
            return booleanContains(
              polygon([repairedPolygon]),
              polygon([repairedCorrectPolygon]),
            );
          }
          return false;
        }) || repairedCorrectPolygon;

      //find all gaps in this outer polygon
      const gaps = repairedPolygons.filter(
        (repairedPolygon) =>
          JSON.stringify(repairedPolygon) !== JSON.stringify(outerPolygon) &&
          booleanContains(polygon([outerPolygon]), polygon([repairedPolygon])),
      );

      const correctPolygons = [outerPolygon, ...gaps];

      //check user click is right or wrong:
      //for checking aginst click, convert everything to our coords
      const ourOuterPolygon = outerPolygon.map(toOurPixelCoordinates);
      const ourGaps = gaps?.map((gap) => gap.map(toOurPixelCoordinates)) ?? [];
      //check if in outer poly
      const inOuterPoly = booleanPointInPolygon(
        ourPixelCoordsClickedPoint,
        polygon([ourOuterPolygon]),
      );
      // Check if the clicked point is inside any hole
      const isInsideGap = ourGaps.some((gap) =>
        booleanPointInPolygon(ourPixelCoordsClickedPoint, polygon([gap])),
      );
      //merge the two
      const correctClickedFeature = inOuterPoly && !isInsideGap;

      //coords for <GeoJSON>
      const convertedCoordinates = correctPolygons.map((polygon) =>
        polygon //their pixel coords
          .map(toOurPixelCoordinates) // 2.our pixel coords
          .map((coordinate) => map.unproject(coordinate, zoom)) // 3. leaflet { latlng }
          .map(({ lat, lng }) => [lng, lat]),
      );

      const correctPolygonData = {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: convertedCoordinates,
        },
      } as Feature<Polygon>;

      if (correctClickedFeature) {
        onMapClick({
          correct: true,
          distance: 0,
          guessedPosition: markerPosition,
          correctPolygon: correctPolygonData,
        });
      } else {
        //restored border distance calcs
        const closestDistance = Math.min(
          ...correctFeature.geometry.coordinates.map((polygon) =>
            getDistanceToPolygon(
              ourPixelCoordsClickedPoint,
              polygon.map(toOurPixelCoordinates),
            ),
          ),
        );

        onMapClick({
          correct: false,
          distance: closestDistance,
          guessedPosition: markerPosition,
          correctPolygon: correctPolygonData,
        });
      }
      setPanToOnAnswerRevealed(
        map.unproject(getCenterOfPolygon(ourOuterPolygon), zoom),
      );
    },
  });

  const [panToOnAnswerRevealed, setPanToOnAnswerRevealed] = useState<
    L.LatLng | undefined
  >();
  useEffect(() => {
    if (
      panToOnAnswerRevealed &&
      gameState.status === GameStatus.AnswerRevealed
    ) {
      map.panTo(panToOnAnswerRevealed!);
    }
  }, [map, gameState.status, panToOnAnswerRevealed]);

  const renderGuessMarker = () => {
    if (
      (gameState.status === GameStatus.Guessing && gameState.guess) ||
      gameState.status === GameStatus.AnswerRevealed
    ) {
      return (
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
      );
    }
  };

  const renderCorrectPolygon = () => {
    if (gameState.status !== GameStatus.AnswerRevealed) return;

    return (
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
    );
  };

  return (
    <>
      <LinkClickboxes {...linksData}/>
      {renderGuessMarker()}
      {renderCorrectPolygon()}
    </>
  );
}
