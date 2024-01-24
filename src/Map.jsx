import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import { MapClickHandler } from "./MapClickHandler";

const RunescapeMap = () => {
  const outerBounds = [
    [57.374, -179.961],
    [85.053, 13.143],
  ];

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <MapContainer
        center={[76, -30]}
        zoom={5}
        maxZoom={6}
        style={{ height: "500px", width: "80%" }}
        bounds={{ outerBounds }}
        boundsOptions={{ outerBounds }}
      >
        <MapClickHandler />
        <TileLayer attribution="offline" url={`/rsmap-tiles/{z}/{x}/{y}.png`} />
      </MapContainer>
    </div>
  );
};

export default RunescapeMap;
