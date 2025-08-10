import L from 'leaflet';
import React from 'react';
import mapMetadata from '../data/map-metadata';
import { GameState } from '../types/jingle';

export interface InternalMapState {
  gameState: GameState;
  onMapClick: (clickedPosition: L.LatLng) => void;
  className?: string;

  setMapCenter: React.Dispatch<React.SetStateAction<number[]>>;

  currentMapId: number;
  setCurrentMapId: React.Dispatch<React.SetStateAction<number>>;

  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;

  markerState: {
    markerPosition: L.LatLng | null;
    markerMapId: number;
  };
  setMarkerState: React.Dispatch<
    React.SetStateAction<{
      markerPosition: L.LatLng | null;
      markerMapId: number;
    }>
  >;
}

export enum MapIds {
  Surface = 0,
  ArdoungeUnderground = 2,
  DorgeshKaan = 5,
  KaramjaUnderground = 9,
  MiscUnderground = 11,
  MisthalinUnderground = 12,
  MorytaniaUnderground = 14,
  MorUlRek = 23,
  TarnsLair = 24,
  Zanaris = 28,
  Prifddinas = 29,
  KourendUnderground = 32,
  PrifddinasUnderground = 34,
  PrifddinasGrandLibrary = 35,
  TutorialIsland = 37,
  LMSWildVarrock = 38,
  RuinsOfCamdozaal = 39,
  Abyss = 40,
  LassarUndercity = 41,
  DesertUnderground = 42,
  CamTorum = 44,
  Neypotzli = 45,
  GuardiansOfTheRift = 1001,
  TheScar = 1002,
  GhorrockDungeon = 1003,
  GhorrockPrison = 1004,
  NightmareArena = 1005,
  GuthixianTemple = 1006,
  GoblinTemple = 1007,
  SkotizoLair = 1009,
  CosmicAltar = 1016,
  DeathAltar = 1020,
  BloodAltar = 1021,
  PuroPuro = 1024,
  MournerTunnels = 1025,
  EvilChickenLair = 1027,
  ChaosTunnelsAltar = 1033,
  UndergroundPassUpper = 1035,
  UndergroundPassLower = 1036,
  ToA = 1037,
}

//separated for simplicity's sake.
export const NESTED_MAP_IDS = [
  MapIds.DorgeshKaan,
  MapIds.MorUlRek,
  MapIds.Neypotzli,
  MapIds.PrifddinasGrandLibrary,
  MapIds.PrifddinasUnderground,
  MapIds.LassarUndercity,
  MapIds.GuardiansOfTheRift,
  MapIds.TheScar,
  MapIds.GhorrockDungeon,
  MapIds.GhorrockPrison,
  MapIds.GoblinTemple,
  MapIds.GuthixianTemple,
  MapIds.CosmicAltar,
  MapIds.DeathAltar,
  MapIds.BloodAltar,
  MapIds.PuroPuro,
  MapIds.EvilChickenLair,
  MapIds.ChaosTunnelsAltar,
  MapIds.SkotizoLair,
  MapIds.UndergroundPassLower,
  MapIds.ToA,
  MapIds.NightmareArena
];

export const NESTED_GROUPS = [
  [MapIds.MisthalinUnderground, MapIds.DorgeshKaan],
  [MapIds.KaramjaUnderground, MapIds.MorUlRek],
  [MapIds.CamTorum, MapIds.Neypotzli],
  [MapIds.Prifddinas, MapIds.PrifddinasGrandLibrary],
  [MapIds.Prifddinas, MapIds.PrifddinasUnderground],
  [MapIds.RuinsOfCamdozaal, MapIds.LassarUndercity],
  [MapIds.MisthalinUnderground, MapIds.GuardiansOfTheRift, MapIds.TheScar],
  [MapIds.MiscUnderground, MapIds.GhorrockDungeon, MapIds.GhorrockPrison],
  [MapIds.ArdoungeUnderground, MapIds.GoblinTemple],
  [MapIds.MisthalinUnderground, MapIds.GuthixianTemple],
  [MapIds.Zanaris, MapIds.CosmicAltar],
  [MapIds.Zanaris, MapIds.PuroPuro],
  [MapIds.MorytaniaUnderground, MapIds.BloodAltar],
  [MapIds.MournerTunnels, MapIds.DeathAltar],
  [MapIds.KourendUnderground, MapIds.SkotizoLair],
  [MapIds.Zanaris, MapIds.EvilChickenLair],
  [MapIds.MisthalinUnderground, MapIds.ChaosTunnelsAltar],
  [MapIds.UndergroundPassUpper, MapIds.UndergroundPassLower],
  [MapIds.DesertUnderground, MapIds.ToA],
  [MapIds.MorytaniaUnderground, MapIds.NightmareArena]
];

export const LINKLESS_MAP_IDS = [
  MapIds.LMSWildVarrock, //island map is more iconic.
  MapIds.TarnsLair,
  MapIds.Abyss,
  MapIds.TutorialIsland,
];

//use for map selector
export const mapSelectBaseMaps = [
  ...mapMetadata.filter((m) => m.name === 'Gielinor Surface'),
  ...mapMetadata
    .filter((m) => m.name !== 'Gielinor Surface')
    .sort((a, b) => a.name.localeCompare(b.name)),
];

export const ConfigureNearestNeighbor = (map: L.Map) => {
  //crispy nearest neighbor scaling for high zoom levels.
  const updateZoomClass = () => {
    const zoom = map.getZoom();
    const container = map.getContainer();

    container.classList.remove('zoom-level-2', 'zoom-level-3');
    if (zoom === 2) container.classList.add('zoom-level-2');
    if (zoom === 3) container.classList.add('zoom-level-3');
  };

  map.on('zoomend', updateZoomClass);
  updateZoomClass(); // Set initial

  //cleanup
  return () => {
    if (map) {
      map.off('zoomend', updateZoomClass);
    }
  };
};

export const HandleMapZoom = (
  map: L.Map,
  setZoom: React.Dispatch<React.SetStateAction<number>>,
) => {
  const updateZoom = () => setZoom(map.getZoom());
  map.on('zoomend', updateZoom);

  return () => {
    if (map) {
      map.off('zoomend', updateZoom);
    }
  };
};
