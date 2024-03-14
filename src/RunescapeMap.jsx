import * as React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MapClickHandler } from "./MapClickHandler";
import geojsondata from "./data/GeoJSON";
import { CRS } from "leaflet";
import L from "leaflet";
import { handleMapMoveEnd } from "./utils/handleMapMoveEnd";

const RunescapeMap = ({ currentSong, setGuessResult, setResultVisible }) => {
  const outerBounds = new L.LatLngBounds(
    L.latLng(-78, 0),
    L.latLng(0, 136.696)
  );

  const mapRef = React.useRef(null);

  React.useEffect(() => {
    const map = mapRef.current;

    if (map) {
      map.addEventListener("moveend", handleMapMoveEnd(mapRef, outerBounds));
    }

    return () => {
      if (map) {
        map.removeEventListener("moveend", handleMapMoveEnd(mapRef, outerBounds));
      }
    };
  }, []);

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <MapContainer
        ref={mapRef}
        center={[-35, 92.73]}
        zoom={5}
        maxZoom={6}
        minZoom={4}
        style={{ height: "100vh", width: "100%" }}
        maxBounds={outerBounds}
        maxBoundsViscosity={1}
        crs={CRS.Simple}
      >
        <MapClickHandler
          currentSong={currentSong}
          setGuessResult={setGuessResult}
          setResultVisible={setResultVisible}
        />
        <TileLayer attribution="offline" url={`/rsmap-tiles/{z}/{x}/{y}.png`} />
      </MapContainer>
    </div>
  );
};

export default RunescapeMap;
