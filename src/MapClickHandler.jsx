import React from "react";
import { useMapEvents } from "react-leaflet";

export const MapClickHandler = () => {
  const map = useMapEvents({
    click: (e) => {
      console.log(`Coordinates: ${e.latlng}`)
      map.locate();
    },
  });
  return null;
};
