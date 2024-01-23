import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";

const RunescapeMap = () => {

  const handleMapClick = (e) => {
    console.log(`Clicked at: Lat ${e.lat}, Lng ${e.lng}`);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <MapContainer
        center={[76, -30]}
        zoom={5}
        style={{ height: "500px", width: "80%" }}
        onClick={handleMapClick}
      >
        <TileLayer attribution="offline" url={`/rsmap-tiles/{z}/{x}/{y}.png`} />
      </MapContainer>
    </div>
  );
};

export default RunescapeMap;
