import { UserPreferences } from '../types/jingle';

export const DEFAULT_PREFERENCES: UserPreferences = {
  preferHardMode: false,
  preferOldAudio: false,
  preferConfirmation: true,
  regions: {
    Misthalin: true,
    Karamja: true,
    Asgarnia: true,
    Fremennik: true,
    Kandarin: true,
    Desert: true,
    Morytania: true,
    Tirannwn: true,
    Wilderness: true,
    Kourend: true,
    Varlamore: true,
  },
  undergroundSelected: true,
  surfaceSelected: true,
};
