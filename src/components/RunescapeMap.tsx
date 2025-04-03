import { booleanContains, booleanPointInPolygon, polygon } from '@turf/turf';
import { GeoJsonObject } from 'geojson';
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
import { Guess } from '../hooks/useGameLogic';
import { Point } from '../types/geometry';
import { GameState, GameStatus } from '../types/jingle';
import {
  calculateDistance,
  closePolygon,
  featureMatchesSong,
  getCenterOfPolygon,
  getDistanceToPolygon,
  toOurPixelCoordinates,
} from '../utils/map-utils';
import { loadPreferencesFromBrowser } from '../utils/browserUtil';
import { DEFAULT_PREFERENCES } from '../constants/defaultPreferences';
const outerBounds = new L.LatLngBounds(L.latLng(-78, 0), L.latLng(0, 136.696));
const settingsConfirm = true;


interface RunescapeMapProps {
  gameState: GameState;
  onGuess: (guess: Guess) => void;
  className?: string;
  confirmedGuess: boolean; 
  setShowConfirmGuess: React.Dispatch<React.SetStateAction<boolean>>;
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
      style={{ height: '100vh', width: '100%' }}
      maxBounds={outerBounds}
      maxBoundsViscosity={1}
      crs={CRS.Simple}
      className={className}
    >
      <RunescapeMap {...props} />
      <TileLayer
        attribution='offline'
        url={`/rsmap-tiles/{z}/{x}/{y}.png`}
      />
    </MapContainer>
  );
}


function RunescapeMap({ gameState, onGuess, confirmedGuess, setShowConfirmGuess }: RunescapeMapProps) {

  const currentSong = gameState.songs[gameState.round];
  const [markerPosition, setMarkerPosition] = useState<L.LatLng | null>(null);
  const map = useMap(); // Get Leaflet map instance

  useMapEvents({
    click: async (e) => { //handle marker position on map clicks
      if (gameState.status !== GameStatus.Guessing) return;
      if(markerPosition === null){setShowConfirmGuess(true);}
      setMarkerPosition(e.latlng);
    },
  });

  useEffect(()=>{
    if(settingsConfirm && !confirmedGuess){return;}

    OnConfirmGuess(map, markerPosition, setMarkerPosition, currentSong, onGuess);
  },[confirmedGuess, markerPosition]) 

  function OnConfirmGuess(map: L.Map, markerPosition: L.LatLng | null, setMarkerPosition: React.Dispatch<React.SetStateAction<L.LatLng | null>>,
    currentSong: string, onGuess: (guess: Guess) => void) {
    if(!markerPosition){return;} //TEMP SOL. TODO: MAKE IT SO CONFIRM GUESS BUTTON IS ONLY VISIBLE IF MARKER IS PLACED.
    const zoom = map.getMaxZoom();
    const { x, y } = map.project(markerPosition, zoom);
    console.log(markerPosition);
    const ourPixelCoordsClickedPoint = [x, y] as Point;
  
  
    const correctFeature = geojsondata.features.find(
      featureMatchesSong(currentSong)
    )!;
  
    //all closed polys for current song
    const repairedPolygons = correctFeature.geometry.coordinates.map(closePolygon);
  
    // Create a GeoJSON feature for the nearest correct polygon
    const correctPolygon = correctFeature.geometry.coordinates.sort(
      (polygon1, polygon2) => {
        const c1 = getCenterOfPolygon(polygon1.map(toOurPixelCoordinates));
        const c2 = getCenterOfPolygon(polygon2.map(toOurPixelCoordinates));
        const d1 = calculateDistance(ourPixelCoordsClickedPoint, c1);
        const d2 = calculateDistance(ourPixelCoordsClickedPoint, c2);
        return d1 - d2;
      }
    )[0];
  
    //if closest correct polgy is a gap, set outerPolygon to the actual parent poly, else iteself.
    const repairedCorrectPolygon = closePolygon(correctPolygon);
  
    const outerPolygon = repairedPolygons.find((repairedPolygon) => {
      if (JSON.stringify(repairedPolygon) !==
        JSON.stringify(repairedCorrectPolygon)) {
        return booleanContains(
          polygon([repairedPolygon]),
          polygon([repairedCorrectPolygon])
        );
      }
      return false;
    }) || repairedCorrectPolygon;
  
    //find all gaps in this outer polygon
    const gaps = repairedPolygons.filter(
      (repairedPolygon) => JSON.stringify(repairedPolygon) !== JSON.stringify(outerPolygon) &&
        booleanContains(polygon([outerPolygon]), polygon([repairedPolygon]))
    );
  
    const correctPolygons = [outerPolygon, ...gaps];
  
    //check user click is right or wrong:
    //for checking aginst click, convert everything to our coords
    const ourOuterPolygon = outerPolygon.map(toOurPixelCoordinates);
    const ourGaps = gaps?.map((gap) => gap.map(toOurPixelCoordinates)) ?? [];
    //check if in outer poly
    const inOuterPoly = booleanPointInPolygon(
      ourPixelCoordsClickedPoint,
      polygon([ourOuterPolygon])
    );
    // Check if the clicked point is inside any hole
    const isInsideGap = ourGaps.some((gap) => booleanPointInPolygon(ourPixelCoordsClickedPoint, polygon([gap]))
    );
    //merge the two
    const correctClickedFeature = inOuterPoly && !isInsideGap;
  
    //coords for <GeoJSON>
    const convertedCoordinates = correctPolygons.map(
      (polygon) => polygon //their pixel coords
        .map(toOurPixelCoordinates) // 2.our pixel coords
        .map((coordinate) => map.unproject(coordinate, zoom)) // 3. leaflet { latlng }
        .map(({ lat, lng }) => [lng, lat])
    );
  
    const correctPolygonData = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: convertedCoordinates,
      },
    } as GeoJsonObject;
  
    if (correctClickedFeature) {
      onGuess({
        correct: true,
        distance: 0,
        guessedPosition: markerPosition,
        correctPolygon: correctPolygonData,
      });
    } else {
      //restored border distance calcs
      const closestDistance = Math.min(
        ...correctFeature.geometry.coordinates.map((polygon) => getDistanceToPolygon(
          ourPixelCoordsClickedPoint,
          polygon.map(toOurPixelCoordinates)
        )
        )
      );
  
      onGuess({
        correct: false,
        distance: closestDistance,
        guessedPosition: markerPosition,
        correctPolygon: correctPolygonData,
      });
    }
  
    map.panTo(
      map.unproject(
        getCenterOfPolygon(
          ourOuterPolygon
        ),
        zoom
      )
    );
  
    //finally, clear marker for the next song
    setMarkerPosition(null);
  }
  

  return (
    <>
      {markerPosition && (
        <Marker
          position={markerPosition}
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
              color: '#0d6efd', // Outline color
              fillColor: '#0d6efd', // Fill color
              weight: 5, // Outline thickness
              fillOpacity: 0.5, // Opacity of fill
              transition: 'all 2000ms',
            })}
          />
        </>
      )}
      <TileLayer
        attribution='offline'
        url={`/rsmap-tiles/{z}/{x}/{y}.png`}
      />
    </>
  );
}
