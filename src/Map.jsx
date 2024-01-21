import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const RunescapeMap = () => {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <MapContainer
        // style={{ height: "100%", width: "100%" }}
        center={[75, -50]} // Adjust this as needed
        zoom={2}
        maxZoom={6} // Set max zoom level
      >
        <TileLayer attribution="offline" url={`/rsmap-tiles/{z}/{x}/{y}.png`} />
      </MapContainer>
    </div>
  );
};

export default RunescapeMap;
