import * as React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MapClickHandler } from "./MapClickHandler";
import geojsondata from "./data/GeoJSON";
import { Point, CRS } from "leaflet";

const RunescapeMap = () => {
  const outerBounds = [
    [57.374, -179.961],
    [85.053, 13.143],
  ];
  
  const musicAreas = [];
  const musicAreaCoordinatesInTwo = [];
  const musicAreaPoints = {};

  for (let i = 0; i < geojsondata.features.length; i++) {
    musicAreas.push(geojsondata.features[i]); // the whole area data
  
    const coordinates = musicAreas[i].geometry.coordinates[0]; // Assuming it's a Polygon with outer coordinates
    const pointArray = [];
  
    for (let j = 0; j < coordinates.length; j++) {
      const [x, y] = coordinates[j];
      const point = new Point(x, y);
      pointArray.push(point);
      
      // Unprojecting the point
      const unprojectedPoint = CRS.EPSG3857.unproject(point);
      console.log("Unprojected Point:", unprojectedPoint);
    }
  
    musicAreaCoordinatesInTwo.push(pointArray);
    const songName = musicAreas[i].properties.title;
    const match = songName.match(/\/w\/([^"]*)/);
    if (match) {
      const result = match[i];
      musicAreaPoints[result] = pointArray;
    }
    
  }
  
  // Now, musicAreaCoordinatesInTwo contains arrays of Pointer objects for each pair of coordinates.
  

  // console.log(`music areas: ` + musicAreas.length);
  // console.log(`music area coordinates:\n${musicAreas[450].properties.title}\n${musicAreaCoordinates[450]}\n${musicAreaCoordinatesInTwo[450]}`);
  // console.log(`Points: ${musicAreaCoordinatesInTwo}`);
  console.log(musicAreaPoints)

  for (let i = 0; i < geojsondata.features[0].geometry.coordinates.length; i++) {
    
  }

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
