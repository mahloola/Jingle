const basemaps = [
  {
    "mapId": 0,
    "name": "Gielinor Surface",
    "bounds": [
      [960, 2432],
      [4032, 4224]
    ],
    "center": [2496, 3328]
  },
  {
    "mapId": 1,
    "name": "Ancient Cavern",
    "bounds": [
      [1664, 5248],
      [1920, 5504]
    ],
    "center": [1760, 5344]
  },
  {
    "mapId": 2,
    "name": "Ardougne Underground",
    "bounds": [
      [2432, 9536],
      [2816, 9920]
    ],
    "center": [2575, 9694]
  },
  {
    "mapId": 3,
    "name": "Asgarnia Ice Cave",
    "bounds": [
      [2816, 9472],
      [3264, 9728]
    ],
    "center": [2973, 9568]
  },
  {
    "mapId": 4,
    "name": "Braindeath Island",
    "bounds": [
      [2048, 4992],
      [2240, 5248]
    ],
    "center": [2144, 5101]
  },
  {
    "mapId": 5,
    "name": "Dorgesh-Kaan",
    "bounds": [
      [2624, 5184],
      [2944, 5568]
    ],
    "center": [2720, 5344]
  },
  {
    "mapId": 6,
    "name": "Dwarven Mines",
    "bounds": [
      [2880, 9600],
      [3328, 9920]
    ],
    "center": [3040, 9824]
  },
  {
    "mapId": 7,
    "name": "God Wars Dungeon",
    "bounds": [
      [2752, 5056],
      [3072, 5440]
    ],
    "center": [2880, 5312]
  },
  {
    "mapId": 8,
    "name": "Ghorrock Prison",
    "bounds": [
      [2816, 6272],
      [3072, 6528]
    ],
    "center": [2935, 6391]
  },
  {
    "mapId": 9,
    "name": "Karamja Underground",
    "bounds": [
      [2496, 9280],
      [3008, 9728]
    ],
    "center": [2691, 9564]
  },
  {
    "mapId": 10,
    "name": "Keldagrim",
    "bounds": [
      [2752, 9984],
      [3008, 10304]
    ],
    "center": [2879, 10176]
  },
  {
    "mapId": 11,
    "name": "Miscellania Underground",
    "bounds": [
      [2048, 10112],
      [2944, 10560]
    ],
    "center": [2559, 10303]
  },
  {
    "mapId": 12,
    "name": "Misthalin Underground",
    "bounds": [
      [3008, 9408],
      [3392, 10112]
    ],
    "center": [3168, 9632]
  },
  {
    "mapId": 13,
    "name": "Mole Hole",
    "bounds": [
      [1664, 5056],
      [1856, 5312]
    ],
    "center": [1760, 5183]
  },
  {
    "mapId": 14,
    "name": "Morytania Underground",
    "bounds": [
      [3264, 9472],
      [3968, 10048]
    ],
    "center": [3479, 9837]
  },
  {
    "mapId": 15,
    "name": "Mos Le'Harmless Cave",
    "bounds": [
      [3648, 9280],
      [3904, 9536]
    ],
    "center": [3775, 9407]
  },
  {
    "mapId": 16,
    "name": "Ourania Altar",
    "bounds": [
      [2944, 5504],
      [3136, 5696]
    ],
    "center": [3040, 5600]
  },
  {
    "mapId": 17,
    "name": "Fremennik Slayer Cave",
    "bounds": [
      [2624, 9856],
      [2880, 10112]
    ],
    "center": [2784, 10016]
  },
  {
    "mapId": 18,
    "name": "Stronghold of Security",
    "bounds": [
      [1792, 4800],
      [2112, 5312]
    ],
    "center": [1888, 5216]
  },
  {
    "mapId": 19,
    "name": "Stronghold Underground",
    "bounds": [
      [2176, 9664],
      [2624, 10112]
    ],
    "center": [2432, 9812]
  },
  {
    "mapId": 20,
    "name": "Taverley Underground",
    "bounds": [
      [2560, 9536],
      [3072, 10112]
    ],
    "center": [2912, 9824]
  },
  {
    "mapId": 21,
    "name": "Tolna's Rift",
    "bounds": [
      [3008, 5184],
      [3200, 5376]
    ],
    "center": [3104, 5280]
  },
  {
    "mapId": 22,
    "name": "Troll Stronghold",
    "bounds": [
      [2752, 9984],
      [3072, 10240]
    ],
    "center": [2822, 10087]
  },
  {
    "mapId": 23,
    "name": "Mor Ul Rek",
    "bounds": [
      [2304, 4928],
      [2624, 5248]
    ],
    "center": [2489, 5118]
  },
  {
    "mapId": 24,
    "name": "Lair of Tarn Razorlor",
    "bounds": [
      [3072, 4480],
      [3456, 4736]
    ],
    "center": [3168, 4564]
  },
  {
    "mapId": 25,
    "name": "Waterbirth Dungeon",
    "bounds": [
      [2368, 9536],
      [2816, 10240]
    ],
    "center": [2495, 10144]
  },
  {
    "mapId": 26,
    "name": "Wilderness Dungeons",
    "bounds": [
      [2816, 9984],
      [3520, 10496]
    ],
    "center": [3040, 10303]
  },
  {
    "mapId": 27,
    "name": "Yanille Underground",
    "bounds": [
      [2240, 9344],
      [2752, 9600]
    ],
    "center": [2580, 9522]
  },
  {
    "mapId": 28,
    "name": "Zanaris",
    "bounds": [
      [2304, 4288],
      [2560, 4544]
    ],
    "center": [2447, 4448]
  },
  {
    "mapId": 29,
    "name": "Prifddinas",
    "bounds": [
      [3072, 5888],
      [3456, 6272]
    ],
    "center": [3263, 6079]
  },
  {
    "mapId": 30,
    "name": "Fossil Island Underground",
    "bounds": [
      [3520, 10048],
      [4032, 10368]
    ],
    "center": [3744, 10272]
  },
  {
    "mapId": 31,
    "name": "Feldip Hills Underground",
    "bounds": [
      [1792, 8896],
      [2176, 9280]
    ],
    "center": [1989, 9023]
  },
  {
    "mapId": 32,
    "name": "Kourend Underground",
    "bounds": [
      [1280, 9728],
      [1984, 10240]
    ],
    "center": [1664, 10048]
  },
  {
    "mapId": 33,
    "name": "Kebos Underground",
    "bounds": [
      [1024, 9792],
      [1472, 10368]
    ],
    "center": [1266, 10206]
  },
  {
    "mapId": 34,
    "name": "Prifddinas Underground",
    "bounds": [
      [3072, 12288],
      [3392, 12608]
    ],
    "center": [3263, 12479]
  },
  {
    "mapId": 35,
    "name": "Prifddinas Grand Library",
    "bounds": [
      [2496, 6016],
      [3136, 6272]
    ],
    "center": [2623, 6143]
  },
  {
    "mapId": 36,
    "name": "LMS Desert Island",
    "bounds": [
      [3328, 5696],
      [3584, 5952]
    ],
    "center": [3456, 5824]
  },
  {
    "mapId": 37,
    "name": "Tutorial Island",
    "bounds": [
      [1536, 5952],
      [1856, 6272]
    ],
    "center": [1695, 6111]
  },
  {
    "mapId": 38,
    "name": "LMS Wild Varrock",
    "bounds": [
      [3392, 5952],
      [3712, 6272]
    ],
    "center": [3552, 6120]
  },
  {
    "mapId": 39,
    "name": "Ruins of Camdozaal",
    "bounds": [
      [2816, 5696],
      [3136, 5952]
    ],
    "center": [2952, 5766]
  },
  {
    "mapId": 40,
    "name": "The Abyss",
    "bounds": [
      [2880, 4672],
      [3200, 4992]
    ],
    "center": [3040, 4832]
  },
  {
    "mapId": 41,
    "name": "Lassar Undercity",
    "bounds": [
      [2432, 6208],
      [2816, 6528]
    ],
    "center": [2656, 6368]
  },
  {
    "mapId": 42,
    "name": "Kharidian Desert Underground",
    "bounds": [
      [3072, 9024],
      [3584, 9728]
    ],
    "center": [3488, 9504]
  },
  {
    "mapId": 43,
    "name": "Varlamore Underground",
    "bounds": [
      [1216, 9216],
      [1920, 9664]
    ],
    "center": [1696, 9504]
  },
  {
    "mapId": 44,
    "name": "Cam Torum",
    "bounds": [
      [1280, 9408],
      [1600, 9728]
    ],
    "center": [1440, 9568]
  },
  {
    "mapId": 45,
    "name": "Neypotzli",
    "bounds": [
      [1280, 9472],
      [1600, 9856]
    ],
    "center": [1440, 9632]
  }
  // {
  //   "mapId": -1,
  //   "name": "debug",
  //   "bounds": [
  //     [960, 1152],
  //     [4288, 12672]
  //   ],
  //   "center": [2496, 3328]
  // }
]

export default basemaps