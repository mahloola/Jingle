import { Guess } from "../types/jingle";
import { GameState } from "../types/jingle";
import rawBasemaps from "../data/basemaps";
import L from 'leaflet'

export interface InternalMapState { 
  gameState: GameState;
  onMapClick: (guess: Guess) => void;
  className?: string;

  setMapCenter: React.Dispatch<React.SetStateAction<number[]>>;

  currentMapId: number;
  setCurrentMapId: React.Dispatch<React.SetStateAction<number>>;

  zoom: number;
  setZoom:  React.Dispatch<React.SetStateAction<number>>;

  markerState: {
    markerPosition: L.LatLng | null;
    markerMapId: number;
  }
  setMarkerState: React.Dispatch<React.SetStateAction<{
    markerPosition: L.LatLng | null;
    markerMapId: number;
  }>>
}

export enum MapIds{
  Surface = 0,
  DorgeshKaan = 5,
  KaramjaUnderground = 9,
  MisthalinUnderground = 12,
  MorUlRek = 23,
  TarnsLair = 24,
  Prifddinas = 29,
  PrifddinasUnderground = 34,
  PrifddinasGrandLibrary = 35,
  TutorialIsland = 37,
  LMSWildVarrock = 38,
  RuinsOfCamdozaal = 39,
  Abyss = 40,
  LassarUndercity = 41,
  CamTorum = 44,
  Neypotzli = 45,
}

//separated for simplicity's sake.
export const NESTED_MAP_IDS = [
    MapIds.DorgeshKaan,
    MapIds.MorUlRek,
    MapIds.Neypotzli,
    MapIds.PrifddinasGrandLibrary,
    MapIds.PrifddinasUnderground,
    MapIds.LassarUndercity

];
export const CHILD_PARENT_MAP_ID_PAIRS = [
    [MapIds.DorgeshKaan, MapIds.MisthalinUnderground],
    [MapIds.MorUlRek, MapIds.KaramjaUnderground],
    [MapIds.Neypotzli, MapIds.CamTorum],
    [MapIds.PrifddinasGrandLibrary,MapIds.Prifddinas],
    [MapIds.PrifddinasUnderground, MapIds.Prifddinas],
    [MapIds.LassarUndercity, MapIds.RuinsOfCamdozaal]
]

export const LINKLESS_MAP_IDS = [
    MapIds.LMSWildVarrock, //island map is more iconic.
    MapIds.TarnsLair,
    MapIds.Abyss, 
    MapIds.TutorialIsland
  ]

//use for map selector
export const mapSelectBaseMaps = [
    ...rawBasemaps.filter(m => m.name === "Gielinor Surface"),
    ...rawBasemaps
      .filter(m => m.name !== "Gielinor Surface")
      .sort((a, b) => a.name.localeCompare(b.name))
  ]

export const ConfigureNearestNeighbor = (map: L.Map) => {

    //crispy nearest neighbor scaling for high zoom levels.
    const updateZoomClass = () => {

        const zoom = map.getZoom();
        const container = map.getContainer();

        container.classList.remove("zoom-level-2", "zoom-level-3");
        if (zoom === 2) container.classList.add("zoom-level-2");
        if (zoom === 3) container.classList.add("zoom-level-3");
    };

    map.on("zoomend", updateZoomClass);
    updateZoomClass(); // Set initial

    //cleanup
    return () => {
        if (map) {
            map.off("zoomend", updateZoomClass);
        }
    };

}




export const HandleMapZoom = (map: L.Map, setZoom: React.Dispatch<React.SetStateAction<number>>) => {

    const updateZoom = () => setZoom(map.getZoom());
    map.on("zoomend", updateZoom);

    return () => {
        if (map) {
            map.off("zoomend", updateZoom);
        }
    };
}
