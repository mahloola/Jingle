import * as React from "react";
import { ImageOverlay, MapContainer, Polygon, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MapClickHandler } from "./MapClickHandler";
import geojsondata from "./data/GeoJSON";
import { Point, CRS, bounds } from "leaflet";
import L from "leaflet";

const RunescapeMap = ({ currentSong, setGuessResult, setResultVisible }) => {
  const outerBounds = new L.LatLngBounds([
    [-78, 0],
    [0, 136.696],
  ]);
  const musicAreas = [];
  const musicAreaPolygons = [];
  for (let i = 0; i < geojsondata.features.length; i++) {
    musicAreas.push(geojsondata.features[i]);
    const coordinates = geojsondata.features[i].geometry.coordinates[0];
    const latLngArray = coordinates.map(([lat, lng]) => [lat, lng]);

    // Create LatLng array and use it to create a Polygon
    const polygon = L.polygon(latLngArray);

    musicAreaPolygons.push(polygon);
  }

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <MapContainer
        center={[-35, 92.73]}
        zoom={5}
        maxZoom={6}
        minZoom={4}
        style={{ height: "100vh", width: "100%" }}
        bounds={{ outerBounds }}
        boundsOptions={{ outerBounds }}
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
