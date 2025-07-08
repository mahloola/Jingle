import { useState } from 'react';
import { Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import mapMetadata from '../data/map-metadata';
import { groupedLinks, MapLink } from '../data/map-links';
import { match } from 'ts-pattern';

export interface LayerPortalsProps {
  currentmapId: number;
  onPortalClick: (link: MapLink) => void;
}
export default function LayerPortals({ currentmapId, onPortalClick }: LayerPortalsProps) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  map.on('zoomend', () => setZoom(map.getZoom()));

  const iconSize = match(zoom)
    .with(0, () => 16)
    .with(1, () => 24)
    .with(2, () => 28)
    .with(3, () => 46)
    .otherwise(() => 32);
  const offset = match(zoom)
    .with(0, () => ({ x: -9, y: 9 }))
    .with(1, () => ({ x: -68 / 10, y: 68 / 10 }))
    .with(2, () => ({ x: -41 / 10, y: 40 / 10 }))
    .with(3, () => ({ x: -34 / 10, y: 31 / 10 }))
    .otherwise(() => ({ x: 0, y: 0 }));

  const currentMap = mapMetadata[currentmapId];
  const mapIdLinks = groupedLinks[currentMap.name];
  return mapIdLinks?.map((link, i) => (
    <Marker
      key={i}
      eventHandlers={{ click: () => onPortalClick(link) }}
      position={[link.start.y + offset.y, link.start.x + offset.x]}
      opacity={0}
      icon={
        new L.Icon({
          iconUrl:
            currentmapId === 0
              ? '/assets/osrs_dungeon_map_link_icon.png'
              : '/assets/osrs_map_link_icon.png',
          iconSize: [iconSize, iconSize],
          iconAnchor: [0, 0],
        })
      }
    />
  ));
}
