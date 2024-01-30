import React, { useState } from "react";
import { Marker, useMapEvents } from "react-leaflet";
import { Icon } from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import { polygon, booleanPointInPolygon } from "@turf/turf";
import geojsondata from "./data/GeoJSON";

export const MapClickHandler = () => {
  const [position, setPosition] = useState(null);

  const map = useMapEvents({
    click: (e) => {
      setPosition(e.latlng);
      const zoom = map.getMaxZoom();
      const clickedPointPixels = map.project(e.latlng, zoom);
      for (const feature of geojsondata.features) {
        const scaleFactor = 3;
        const adjustedCoordinates = ([x, y]) => [
          x * scaleFactor - 3108,
          -(y * scaleFactor) + 12450,
        ];
        let foundFeature = false;
        for (let i = 0; i < feature.geometry.coordinates.length; i++) {
          const coordinates = feature.geometry.coordinates[i].map(adjustedCoordinates);
          // if first and last coordinates are unequal, push the first coordinate to the end
          if (
            coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
            coordinates[0][1] !== coordinates[coordinates.length - 1][1]
          ) {
            coordinates.push(coordinates[0]);
          }
          const poly = polygon([coordinates]);
          const clickedPoint = [clickedPointPixels.x, clickedPointPixels.y];
          if (booleanPointInPolygon(clickedPoint, poly)) {
            console.log("CLICKED ON FEATURE:", feature.properties.title);

            foundFeature = true;
            break;
          }
        }
        if (foundFeature) {
          break;
        }
      }
    },
  });

  return position ? (
    <Marker
      position={position}
      icon={
        new Icon({
          iconUrl: markerIconPng,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        })
      }
    />
  ) : undefined;
};

export default MapClickHandler;