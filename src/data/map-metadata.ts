import { Position } from 'geojson';

interface MapMetadata {
  mapId: number;
  name: string;
  bounds: [Position, Position];
  center: [number, number];
}

const mapMetadata: MapMetadata[] = [
  {
    mapId: 0,
    name: 'Gielinor Surface',
    bounds: [
      [960, 2048],
      [4032, 4224],
    ],
    center: [2496, 3328],
  },
  {
    mapId: 1,
    name: 'Ancient Cavern',
    bounds: [
      [1728, 5312],
      [1856, 5440],
    ],
    center: [1760, 5344],
  },
  {
    mapId: 2,
    name: 'Ardougne Underground',
    bounds: [
      [2496, 9600],
      [2752, 9856],
    ],
    center: [2575, 9694],
  },
  {
    mapId: 3,
    name: 'Asgarnia Ice Cave',
    bounds: [
      [2880, 9536],
      [3200, 9664],
    ],
    center: [2973, 9568],
  },
  {
    mapId: 4,
    name: 'Braindeath Island',
    bounds: [
      [2112, 5056],
      [2176, 5184],
    ],
    center: [2144, 5101],
  },
  {
    mapId: 5,
    name: 'Dorgesh-Kaan',
    bounds: [
      [2688, 5248],
      [2880, 5504],
    ],
    center: [2720, 5344],
  },
  {
    mapId: 6,
    name: 'Dwarven Mines',
    bounds: [
      [2944, 9664],
      [3264, 9856],
    ],
    center: [3040, 9824],
  },
  {
    mapId: 7,
    name: 'God Wars Dungeon',
    bounds: [
      [2816, 5120],
      [3008, 5376],
    ],
    center: [2880, 5312],
  },
  {
    mapId: 10,
    name: 'Keldagrim',
    bounds: [
      [2816, 10048],
      [2944, 10240],
    ],
    center: [2879, 10176],
  },
  {
    mapId: 12,
    name: 'Misthalin Underground',
    bounds: [
      [3072, 9472],
      [3456, 10048],
    ],
    center: [3168, 9632],
  },
  {
    mapId: 28,
    name: 'Zanaris',
    bounds: [
      [2368, 4352],
      [2496, 4480],
    ],
    center: [2447, 4448],
  },
  {
    mapId: 13,
    name: 'Mole Hole',
    bounds: [
      [1728, 5120],
      [1792, 5248],
    ],
    center: [1760, 5183],
  },
  {
    mapId: 14,
    name: 'Morytania Underground',
    bounds: [
      [3328, 9536],
      [3904, 9984],
    ],
    center: [3479, 9837],
  },
  {
    mapId: 15,
    name: "Mos Le'Harmless Cave",
    bounds: [
      [3712, 9344],
      [3840, 9472],
    ],
    center: [3775, 9407],
  },
  {
    mapId: 16,
    name: 'Ourania Altar',
    bounds: [
      [3008, 5568],
      [3072, 5632],
    ],
    center: [3040, 5600],
  },
  {
    mapId: 17,
    name: 'Fremennik Slayer Cave (overwrite regions)',
    bounds: [
      [2688, 9920],
      [2816, 10048],
    ],
    center: [2784, 0],
  },
  {
    mapId: 18,
    name: 'Stronghold of Security',
    bounds: [
      [1856, 4864],
      [2048, 5248],
    ],
    center: [1888, 5216],
  },
  {
    mapId: 19,
    name: 'Stronghold Underground',
    bounds: [
      [2240, 9728],
      [2560, 10048],
    ],
    center: [2432, 9812],
  },
  {
    mapId: 20,
    name: 'Taverley Underground',
    bounds: [
      [2624, 9600],
      [3008, 10048],
    ],
    center: [2912, 9824],
  },
  {
    mapId: 21,
    name: "Tolna's Rift",
    bounds: [
      [3072, 5248],
      [3136, 5312],
    ],
    center: [3104, 5280],
  },
  {
    mapId: 22,
    name: 'Troll Stronghold',
    bounds: [
      [2816, 10048],
      [3008, 10176],
    ],
    center: [2822, 10087],
  },
  {
    mapId: 23,
    name: 'Mor Ul Rek',
    bounds: [
      [2368, 4992],
      [2560, 5184],
    ],
    center: [2489, 5118],
  },
  {
    mapId: 24,
    name: 'Lair of Tarn Razorlor',
    bounds: [
      [3136, 4544],
      [3392, 4672],
    ],
    center: [3168, 4564],
  },
  {
    mapId: 25,
    name: 'Waterbirth Dungeon',
    bounds: [
      [2432, 9600],
      [2752, 10176],
    ],
    center: [2495, 10144],
  },
  {
    mapId: 26,
    name: 'Wilderness Dungeons',
    bounds: [
      [2880, 10048],
      [3456, 10432],
    ],
    center: [3040, 10303],
  },
  {
    mapId: 27,
    name: 'Yanille Underground',
    bounds: [
      [2304, 9408],
      [2688, 9536],
    ],
    center: [2580, 9522],
  },
  {
    mapId: 29,
    name: 'Prifddinas',
    bounds: [
      [3136, 5952],
      [3392, 6208],
    ],
    center: [3263, 6079],
  },
  {
    mapId: 30,
    name: 'Fossil Island Underground',
    bounds: [
      [3584, 10112],
      [3968, 10304],
    ],
    center: [3744, 10272],
  },
  {
    mapId: 31,
    name: 'Feldip Hills Underground (overwrite regions)',
    bounds: [
      [1664, 8960],
      [2112, 9216],
    ],
    center: [1989, 9023],
  },
  {
    mapId: 32,
    name: 'Kourend Underground',
    bounds: [
      [1280, 9792],
      [1920, 10176],
    ],
    center: [1664, 10048],
  },
  {
    mapId: 33,
    name: 'Kebos Underground',
    bounds: [
      [1088, 9856],
      [1408, 10304],
    ],
    center: [1266, 10206],
  },
  {
    mapId: 34,
    name: 'Prifddinas Underground',
    bounds: [
      [3136, 12352],
      [3328, 12544],
    ],
    center: [3263, 12479],
  },
  {
    mapId: 35,
    name: 'Prifddinas Grand Library',
    bounds: [
      [2560, 6080],
      [3072, 6208],
    ],
    center: [2623, 6143],
  },
  {
    mapId: 36,
    name: 'LMS Desert Island',
    bounds: [
      [3392, 5760],
      [3520, 5888],
    ],
    center: [3456, 5824],
  },
  {
    mapId: 37,
    name: 'Tutorial Island',
    bounds: [
      [1600, 6016],
      [1792, 6208],
    ],
    center: [1695, 6111],
  },
  {
    mapId: 38,
    name: 'LMS Wild Varrock',
    bounds: [
      [3456, 6016],
      [3648, 6208],
    ],
    center: [3552, 6120],
  },
  {
    mapId: 39,
    name: 'Ruins of Camdozaal',
    bounds: [
      [2880, 5760],
      [3072, 5888],
    ],
    center: [2952, 5766],
  },
  {
    mapId: 40,
    name: 'The Abyss',
    bounds: [
      [2944, 4736],
      [3136, 4928],
    ],
    center: [3040, 4832],
  },
  {
    mapId: 41,
    name: 'Lassar Undercity',
    bounds: [
      [2496, 6272],
      [2752, 6464],
    ],
    center: [2656, 6368],
  },
  {
    mapId: 42,
    name: 'Kharidian Desert Underground',
    bounds: [
      [3136, 9088],
      [3520, 9664],
    ],
    center: [3488, 9504],
  },
  {
    mapId: 43,
    name: 'Varlamore Underground',
    bounds: [
      [1280, 9280],
      [1856, 9856],
    ],
    center: [1696, 9504],
  },
  {
    mapId: 44,
    name: 'Cam Torum',
    bounds: [
      [1344, 9472],
      [1536, 9664],
    ],
    center: [1440, 9568],
  },
  {
    mapId: 45,
    name: 'Neypotzli',
    bounds: [
      [1344, 9472],
      [1536, 9792],
    ],
    center: [1440, 9632],
  },
  {
    mapId: 46,
    name: 'Ardent Ocean Underground',
    bounds: [
      [2560, 9344],
      [3136, 9664],
    ],
    center: [2691, 9564],
  },
  {
    mapId: 47,
    name: 'Unquiet Ocean Underground',
    bounds: [
      [2688, 8832],
      [3328, 8896],
    ],
    center: [3168, 8864],
  },
  {
    mapId: 48,
    name: 'Shrouded Ocean Underground',
    bounds: [
      [1920, 8704],
      [2304, 9344],
    ],
    center: [2016, 9184],
  },
  {
    mapId: 49,
    name: 'Sunset Ocean Underground',
    bounds: [
      [1152, 9152],
      [1216, 9216],
    ],
    center: [1181, 9198],
  },
  {
    mapId: 50,
    name: 'Western Ocean Underground',
    bounds: [
      [1920, 9472],
      [2304, 10048],
    ],
    center: [2264, 9880],
  },
  {
    mapId: 51,
    name: 'Northern Ocean Underground',
    bounds: [
      [2112, 10176],
      [2944, 10496],
    ],
    center: [2559, 10272],
  },
  {
    mapId: 1001,
    name: 'Guardians of the Rift',
    bounds: [
      [3520, 9408],
      [3712, 9600],
    ],
    center: [3616, 9504],
  },
  {
    mapId: 1002,
    name: 'The Scar',
    bounds: [
      [1920, 6272],
      [2176, 6464],
    ],
    center: [2048, 6368],
  },
  {
    mapId: 1003,
    name: 'Ghorrock Dungeon',
    bounds: [
      [2816, 10240],
      [2944, 10368],
    ],
    center: [2880, 10304],
  },
  {
    mapId: 1004,
    name: 'Ghorrock Prison',
    bounds: [
      [3008, 6400],
      [3072, 6464],
    ],
    center: [3040, 6432],
  },
  {
    mapId: 1005,
    name: 'Nightmare Arena',
    bounds: [
      [3776, 9856],
      [3968, 10048],
    ],
    center: [3872, 9952],
  },
  {
    mapId: 1006,
    name: 'Guthixian Temple',
    bounds: [
      [3968, 4352],
      [4160, 4608],
    ],
    center: [4064, 4480],
  },
  {
    mapId: 1007,
    name: 'Goblin Temple',
    bounds: [
      [3712, 4288],
      [3776, 4416],
    ],
    center: [3744, 4352],
  },
  {
    mapId: 1008,
    name: 'Crash Site Cavern',
    bounds: [
      [2048, 5632],
      [2176, 5696],
    ],
    center: [2112, 5664],
  },
  {
    mapId: 1009,
    name: 'Skotizo Lair',
    bounds: [
      [2240, 5632],
      [2304, 5696],
    ],
    center: [2272, 5664],
  },
  {
    mapId: 1010,
    name: 'Air Altar',
    bounds: [
      [2816, 4800],
      [2880, 4864],
    ],
    center: [2848, 4832],
  },
  {
    mapId: 1011,
    name: 'Water Altar',
    bounds: [
      [2688, 4800],
      [2752, 4864],
    ],
    center: [2720, 4832],
  },
  {
    mapId: 1012,
    name: 'Earth Altar',
    bounds: [
      [2624, 4800],
      [2688, 4864],
    ],
    center: [2656, 4832],
  },
  {
    mapId: 1013,
    name: 'Fire Altar',
    bounds: [
      [2560, 4800],
      [2624, 4864],
    ],
    center: [2592, 4832],
  },
  {
    mapId: 1014,
    name: 'Mind Altar',
    bounds: [
      [2752, 4800],
      [2816, 4864],
    ],
    center: [2784, 4832],
  },
  {
    mapId: 1015,
    name: 'Body Altar',
    bounds: [
      [2496, 4800],
      [2560, 4864],
    ],
    center: [2528, 4832],
  },
  {
    mapId: 1016,
    name: 'Cosmic Altar',
    bounds: [
      [2112, 4800],
      [2176, 4864],
    ],
    center: [2144, 4832],
  },
  {
    mapId: 1017,
    name: 'Law Altar',
    bounds: [
      [2432, 4800],
      [2496, 4864],
    ],
    center: [2464, 4832],
  },
  {
    mapId: 1018,
    name: 'Nature Altar',
    bounds: [
      [2368, 4800],
      [2432, 4864],
    ],
    center: [2400, 4832],
  },
  {
    mapId: 1019,
    name: 'Chaos Altar',
    bounds: [
      [2240, 4800],
      [2304, 4864],
    ],
    center: [2272, 4832],
  },
  {
    mapId: 1020,
    name: 'Death Altar',
    bounds: [
      [2176, 4800],
      [2240, 4864],
    ],
    center: [2208, 4832],
  },
  {
    mapId: 1021,
    name: 'Blood Altar',
    bounds: [
      [3200, 4800],
      [3264, 4864],
    ],
    center: [3232, 4832],
  },
  {
    mapId: 1022,
    name: 'Wrath Altar',
    bounds: [
      [2304, 4800],
      [2368, 4864],
    ],
    center: [2336, 4832],
  },
  {
    mapId: 1023,
    name: 'Lithkren Vault',
    bounds: [
      [1536, 5056],
      [1600, 5120],
    ],
    center: [1568, 5088],
  },
  {
    mapId: 1024,
    name: 'Puro Puro',
    bounds: [
      [2560, 4288],
      [2624, 4352],
    ],
    center: [2592, 4320],
  },
  {
    mapId: 1025,
    name: 'Mourner Tunnels',
    bounds: [
      [1856, 4608],
      [2048, 4672],
    ],
    center: [1952, 4640],
  },
  {
    mapId: 1026,
    name: 'Smoke Dungeon',
    bounds: [
      [3136, 9344],
      [3328, 9408],
    ],
    center: [3232, 9376],
  },
  {
    mapId: 1027,
    name: 'Evil Chicken Lair',
    bounds: [
      [2432, 4352],
      [2496, 4416],
    ],
    center: [2464, 4384],
  },
  {
    mapId: 1028,
    name: 'Clan Hall',
    bounds: [
      [1728, 5440],
      [1792, 5504],
    ],
    center: [1760, 5472],
  },
  {
    mapId: 1029,
    name: 'Lighthouse Dungeon',
    bounds: [
      [2496, 9984],
      [2560, 10048],
    ],
    center: [2528, 10016],
  },
  {
    mapId: 1030,
    name: 'Ruins of Tapoyauik',
    bounds: [
      [1536, 9600],
      [1728, 9664],
    ],
    center: [1632, 9632],
  },
  {
    mapId: 1031,
    name: 'Viyeldi Caves',
    bounds: [
      [2368, 4672],
      [2816, 9408],
    ],
    center: [2592, 7040],
  },
  {
    mapId: 1032,
    name: 'Sorceress Garden',
    bounds: [
      [2880, 5440],
      [2944, 5504],
    ],
    center: [2912, 5472],
  },
  {
    mapId: 1033,
    name: 'Chaos Tunnels Altar',
    bounds: [
      [2240, 4800],
      [2304, 4864],
    ],
    center: [2272, 4832],
  },
  {
    mapId: 1034,
    name: 'Black Knight Catacombs',
    bounds: [
      [4032, 4672],
      [4224, 4864],
    ],
    center: [4128, 4768],
  },
  {
    mapId: 1035,
    name: 'Underground Pass Upper',
    bounds: [
      [2368, 9536],
      [2560, 9792],
    ],
    center: [2464, 9664],
  },
  {
    mapId: 1036,
    name: 'Underground Pass Lower',
    bounds: [
      [2112, 4480],
      [2304, 4736],
    ],
    center: [2208, 4608],
  },
  {
    mapId: 1037,
    name: 'Tombs of Amascut',
    bounds: [
      [3584, 5120],
      [3904, 5376],
    ],
    center: [3744, 5248],
  },
  {
    mapId: 1038,
    name: 'Theatre of Blood',
    bounds: [
      [3072, 4224],
      [3392, 4480],
    ],
    center: [2447, 4448],
  },
  {
    mapId: 1039,
    name: 'Haunted Mine',
    bounds: [
      [3392, 9344],
      [3584, 9728],
    ],
    center: [3488, 9536],
  },
  {
    mapId: 1040,
    name: 'Mokha Crypt',
    bounds: [
      [1280, 9344],
      [1344, 9600],
    ],
    center: [1312, 9472],
  },
  {
    mapId: -1,
    name: 'debug',
    bounds: [
      [960, 1216],
      [4224, 12608],
    ],
    center: [2496, 3328],
  },
];

export default mapMetadata;
