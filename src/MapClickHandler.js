import React, { useState, useEffect } from "react";
import { Marker, useMapEvents } from "react-leaflet";
import { Icon, LatLng, Point } from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import { point, polygon, booleanPointInPolygon, Position } from "@turf/turf";
import geojsondata from "./data/GeoJSON";
import { click } from "@testing-library/user-event/dist/click";

export const MapClickHandler = () => {
  const [position, setPosition] = useState(null);
  const [matchedTitle, setMatchedTitle] = useState(null);

  const map = useMapEvents({
    click: (e) => {
      setPosition(e.latlng);
      console.log(`Marked position (pixels): ${map.project(e.latlng, 6)}`);
    },
  });

  useEffect(() => {
    // Check if a position is clicked and GeoJSON data is available
    if (position && geojsondata && geojsondata.features) {
      // Create a point from the clicked position
      const clickedPoint = point([position.lng, position.lat]);
      console.log(clickedPoint);
      // Loop through each GeoJSON feature
      for (const feature of geojsondata.features) {
        // Convert pixel coordinates to geographical coordinates
        try {
          const coordinates = feature.geometry.coordinates[0].map(([x, y]) => {
            const latlng = map.unproject([x, y], 6);
            return [latlng.lng, latlng.lat];
          });

          // Create a Turf polygon from the geographical coordinates
          const poly = polygon([coordinates]);
  
          if (booleanPointInPolygon(clickedPoint, poly)) {
            console.log("works");
            // Set the title of the matching polygon in the state
            setMatchedTitle(feature.properties.title);
            // Exit the loop once a match is found
            break;
          }
        } catch (e) {
          // Handle errors or log if needed
          // console.log(`Failed at`, feature);
        }
        matchedTitle ?? console.log(`Clicked Area Song: ` + matchedTitle);
      }
    }
  }, [position, map]);
  
  

  return (
    <>
      {position != null && (
        <Marker
          position={position}
          icon={
            new Icon({
              iconUrl: markerIconPng,
              iconSize: [25, 41],
              iconAnchor: [12, 41],
            })
          }
        ></Marker>
      )}

      {matchedTitle && <div>Matched Title: {matchedTitle}</div>}
    </>
  );
};

export default MapClickHandler;
