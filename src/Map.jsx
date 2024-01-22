import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";

const RunescapeMap = () => {
  const [markers, setMarkers] = useState([]);

  const handleMapClick = (e) => {
    console.log("hi")
    const newMarker = {
      lat: e.latlng.lat,
      lng: e.latlng.lng,
    };
    console.log(`Clicked at: Lat ${newMarker.lat}, Lng ${newMarker.lng}`);
    setMarkers([...markers, newMarker]);
  };

  // Define bounds for the map
  const bounds = [
    [-90, -70], // Southwest corner
    [90, 180],   // Northeast corner
  ];

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <MapContainer
        center={[75, -50]}
        zoom={4}
        maxZoom={6}
        minZoom={3}
        style={{ height: "500px", width: "80%" }}
        onClick={handleMapClick}
        bounds={bounds} // Set bounds for the map
        maxBoundsViscosity={0.95} // Optional: Elastic effect when reaching bounds
      >
        <TileLayer attribution="offline" url={`/rsmap-tiles/{z}/{x}/{y}.png`} />

        {markers.map((marker, index) => (
          <Marker key={index} position={[marker.lat, marker.lng]}>
            <Popup>
              A marker at ({marker.lat.toFixed(2)}, {marker.lng.toFixed(2)})
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default RunescapeMap;
