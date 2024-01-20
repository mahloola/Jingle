import React, { useRef, useEffect, useState } from 'react';
import { MapContainer, ImageOverlay, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import mapImage from './images/map.png';

const RunescapeMap = () => {
  const imageWidth = 8793;
  const imageHeight = 4993;
  const aspectRatio = imageWidth / imageHeight;

  const [bounds, setBounds] = useState(null);
  const [bounds2, setBounds2] = useState(null);

  // Get the dimensions of the container
  const containerRef = useRef(null);

  useEffect(() => {
    const containerWidth = containerRef.current?.clientWidth || 800; // Default width if container is not yet available
    const containerHeight = containerWidth * aspectRatio;
    console.log(containerHeight, containerWidth)
    setBounds([
      [-50, 0],
      [containerHeight, containerWidth], // Adjusted bounds for the image
    ]);
    setBounds2([
      [0, 0],
      [containerHeight/2, containerWidth/2], // Adjusted bounds for the image
    ]);
  }, [aspectRatio]);

  console.log(bounds);
  // Custom hook to fit the map to the image
  function SetMapBounds() {
    const map = useMap();
    useEffect(() => {
      if (bounds) {
        map.setMaxBounds(bounds); // Set max bounds to prevent stretching
        map.fitWorld();
      }
    }, [map, bounds]);

    return null;
  }

  return (
    <div
      ref={containerRef}
      style={{
        height: '50vh',
        width: '80%',
        maxWidth: '800px',
        margin: '0 auto',
      }}
    >
      <MapContainer
        style={{ height: '100%', width: '100%' }}
        center={[50, 50]} // Adjust this as needed
        zoom={5}
        maxZoom={5} // Set max zoom level
      >
        <SetMapBounds />

        {bounds && (
          <ImageOverlay
            bounds={bounds}
            url={mapImage} // Path to your PNG image
            attribution="osrs music"
          />
        )}
      </MapContainer>
    </div>
  );
};

export default RunescapeMap;
