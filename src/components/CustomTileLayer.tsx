import { TileLayer, useMap } from "react-leaflet";
import { useEffect, useRef } from "react";
import L from "leaflet";

const CustomTileLayer = ({ currentMapId }: { currentMapId: number }) => {
  const map = useMap();
  const layerRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    if (!layerRef.current) return;

    // Override getTileUrl to reflect new mapId
    layerRef.current.getTileUrl = (coords: L.Coords) => {
      const { x, y, z } = coords;
      const tmsY = -y - 1;
      return `/rsmap-tiles/mapIdTiles/${currentMapId}/${z}/0_${x}_${tmsY}.png`;
    };

    layerRef.current.redraw();
  }, [map, currentMapId]);

  return (
    <TileLayer
      url="/placeholder/{z}/{x}/{y}.png"
      minZoom={-1}
      maxZoom={3}
      maxNativeZoom={2}
      tileSize={256}
      ref={(ref) => {
        if (ref) layerRef.current = ref;
      }}
    />
  );
};

export default CustomTileLayer
