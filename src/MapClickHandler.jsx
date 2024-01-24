import React from "react";
import { useState } from "react";
import { Marker, useMapEvents } from "react-leaflet";
import { Icon } from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png"

export const MapClickHandler = () => {
  const [position, setPosition] = useState(null)
  const map = useMapEvents({
    click: (e) => {
      setPosition(e.latlng)
    },
  });
  return (
    <React.Fragment>
      {position != null &&
        <Marker
          position={position}
          icon={new Icon({ iconUrl: markerIconPng, iconSize: [25, 41], iconAnchor: [12, 41] })}
        ></Marker>
      }
    </React.Fragment>

  );
};