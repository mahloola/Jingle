import L, { CRS } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import * as React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { MapClickHandler } from './MapClickHandler';
import { handleMapMoveEnd } from './utils/handleMapMoveEnd';

const RunescapeMap = ({
  setCorrectPolygon,
  correctPolygon,
  currentSong,
  setGuessResult,
  setResultVisible,
  resultVisible,
  userGuessed,
  setDailyResults,
  dailyResults,
  dailyChallengeIndex,
  setDailyComplete,
  startedGame,
}) => {
  const outerBounds = new L.LatLngBounds(
    L.latLng(-78, 0),
    L.latLng(0, 136.696),
  );

  const mapRef = React.useRef(null);

  React.useEffect(() => {
    const map = mapRef.current;

    if (map) {
      map.addEventListener('moveend', handleMapMoveEnd(mapRef, outerBounds));
    }

    return () => {
      if (map) {
        map.removeEventListener(
          'moveend',
          handleMapMoveEnd(mapRef, outerBounds),
        );
      }
    };
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
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
      >
        <MapClickHandler
          setCorrectPolygon={setCorrectPolygon}
          correctPolygon={correctPolygon}
          currentSong={currentSong}
          setGuessResult={setGuessResult}
          setResultVisible={setResultVisible}
          resultVisible={resultVisible}
          userGuessed={userGuessed}
          setDailyResults={setDailyResults}
          dailyResults={dailyResults}
          dailyChallengeIndex={dailyChallengeIndex}
          setDailyComplete={setDailyComplete}
          startedGame={startedGame}
        />
        <TileLayer
          attribution='offline'
          url={`/rsmap-tiles/{z}/{x}/{y}.png`}
        />
      </MapContainer>
    </div>
  );
};

export default RunescapeMap;
