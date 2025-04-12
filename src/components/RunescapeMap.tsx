import { booleanContains, booleanPointInPolygon, polygon } from '@turf/turf';
import { Feature, GeoJsonObject, Polygon } from 'geojson';
import L, { CRS, Icon } from 'leaflet';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import {
  GeoJSON,
  MapContainer,
  Marker,
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
  FindPolyGroups,
  getCenterOfPolygon,
  getDistanceToPolygon,
  toOurPixelCoordinates,
} from '../utils/map-utils';
import { 
   HandleMapZoom, 
   InternalMapState
} from '../utils/map-config';
import basemaps from '../data/basemaps';
import { groupedLinks } from '../data/GroupedLinks';
import LinkClickboxes from './LinkClickboxes';
import CustomTileLayer from './CustomTileLayer';
import { GetClosestMapIdPolys, GetTotalDistanceToPoly } from '../utils/score-dist-utils';

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
      const markerMapId = currentMapId;
      const ourPixelCoordsClickedPoint = [e.latlng.lng, e.latlng.lat] as Point

      const currentSong = gameState.songs[gameState.round];
      const correctFeature = geojsondata.features.find(
        featureMatchesSong(currentSong),
      )!;

      //all polys for for current song as per our mapId priorities - needed for donut polys.
      const [musicPolys, songMapId] = GetClosestMapIdPolys(correctFeature, markerPosition, markerMapId);
      const repairedPolygons = musicPolys.map((musicPoly)=>closePolygon(musicPoly)) as Point[][];

      //find nearest correct poly
      const correctPolygon = repairedPolygons.sort(
        (polygon1, polygon2) => {
          const d1 = GetTotalDistanceToPoly(ourPixelCoordsClickedPoint, markerMapId, polygon1, songMapId);
          const d2 = GetTotalDistanceToPoly(ourPixelCoordsClickedPoint, markerMapId, polygon2, songMapId);
          return d1 - d2;
        }
      )[0];

      const polyGroups = FindPolyGroups(repairedPolygons);
      const [outerPolygon, ...gaps] = polyGroups.find(polyGroup => polyGroup.includes(correctPolygon)) ?? [correctPolygon]

      //check if in outer poly
      const inOuterPoly = booleanPointInPolygon(
        ourPixelCoordsClickedPoint,
        polygon([outerPolygon])
      );
  
      // Check if the clicked point is inside any gap
      const isInsideGap = gaps.some((gap) => booleanPointInPolygon(ourPixelCoordsClickedPoint, polygon([gap]))
      );
      //merge the two. mapId check needed to filter overlapping coords in diff mapIds.
      const correctClickedFeature = inOuterPoly && !isInsideGap && markerMapId == songMapId;

      const correctPolygonsData = polyGroups.map((polyGroup)=> {
        return({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: polyGroup,
        },
        properties: {}
      } as Feature<Polygon>);})

      if (correctClickedFeature) {
        onMapClick({
          correct: true,
          distance: 0,
          guessedPosition: {mapId: markerMapId, position: markerPosition},
          correctPolygons: {mapId: songMapId , polygons: correctPolygonsData},
        });
      } else {
        //restored border distance calcs
        const closestDistance = GetTotalDistanceToPoly([markerPosition.lng, markerPosition.lat], markerMapId,
           correctPolygon, songMapId)

        onMapClick({
          correct: false,
          distance: closestDistance,
          guessedPosition: {mapId: markerMapId, position: markerPosition},
          correctPolygons: {mapId: songMapId ,polygons: correctPolygonsData},
        });
      }
      
      const outerPolyCenter = getCenterOfPolygon(outerPolygon);

      setPanToOnAnswerRevealed(
        {outerPolyCenter, songMapId}
      );
    },
  });

  const [panToOnAnswerRevealed, setPanToOnAnswerRevealed] = useState(
    {outerPolyCenter: [0,0] as Point, 
    songMapId: 0}
  );

  useEffect(() => {
    if (
      panToOnAnswerRevealed &&
      gameState.status === GameStatus.AnswerRevealed
    ) {
        const outerPolyCenter = panToOnAnswerRevealed.outerPolyCenter;
        const songMapId = panToOnAnswerRevealed.songMapId;
        if(songMapId == currentMapId){
          map.panTo([outerPolyCenter[1], outerPolyCenter[0]]);
        }
        else
        {
          setCurrentMapId(songMapId);
          setMapCenter([outerPolyCenter[0], outerPolyCenter[1]]);
        }    
    }
  }, [map, gameState.status, panToOnAnswerRevealed]);

  const renderGuessMarker = () => {
    if (
      ((gameState.status === GameStatus.Guessing && gameState.guess)
      || gameState.status === GameStatus.AnswerRevealed)
      && gameState.guess?.guessedPosition.mapId == currentMapId
    ) {
      return (
        <Marker
          position={gameState.guess!.guessedPosition.position!}
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

  const renderCorrectPolygons = () => {
    if (gameState.status !== GameStatus.AnswerRevealed) return;

    {/* render all polys on current mapId */}
    {currentMapId == gameState.guess?.correctPolygons.mapId &&
      gameState.guess?.correctPolygons.polygons!.map(correctPolygon => { 
       console.log(correctPolygon);
       return <GeoJSON
         data={correctPolygon}
         interactive={false}
         style={() => ({
           color: '#0d6efd', // Outline color
           fillColor: '#0d6efd', // Fill color
           weight: 5, // Outline thickness
           fillOpacity: 0.5, // Opacity of fill
           transition: 'all 2000ms',
         })}
       />
    })}
  };

  return (
    <>
      <LinkClickboxes {...linksData}/>
      {renderGuessMarker()}
      {renderCorrectPolygons()}
    </>
  );
}
