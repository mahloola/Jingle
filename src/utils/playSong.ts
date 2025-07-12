import { RefObject } from 'react';
import { JINGLE_SETTINGS } from '../constants/jingleSettings';
import { audio2004 } from '../data/audio2004';
import { SongService } from './getRandomSong';

export const playSong = (
  audioRef: RefObject<HTMLAudioElement | null>,
  songName: string,
  oldAudio: boolean,
  hardMode: boolean,
  songService: SongService
) => {
  let src;
  if (oldAudio) {
    const oldAudioExists = songName in audio2004;
    src = oldAudioExists
      ? `https://mahloola.com/${songName.trim().replace(/ /g, '_')}_(v1).mp3`
      : `https://mahloola.com/${songName.trim().replace(/ /g, '_')}.mp3`;
  } else {
    src = `https://mahloola.com/${songName.trim().replace(/ /g, '_')}.mp3`;
  }

  audioRef.current!.src = src;
  audioRef.current!.load();

  if(hardMode){
    songService.resetSnippet();
    playSnippet(audioRef, songService);
  }
  else{
  audioRef.current!.play();
  }
};

export const playSnippet = (
  audioRef: RefObject<HTMLAudioElement | null>,
  songService: SongService,
) => {
  const audioPlayer = audioRef.current;
  if (!audioPlayer) return;

  const startPlayback = () => {
    const [start, end] = songService.getSnippet(audioRef)!;
    audioPlayer.currentTime = start;
    audioPlayer.play();

    const stopTime = () => {
      if (audioPlayer.currentTime >= end) {
        audioPlayer.pause();
        audioPlayer.removeEventListener('timeupdate', stopTime);
      }
    };

    audioPlayer.addEventListener('timeupdate', stopTime);
  };

  if (audioPlayer.readyState >= 3) {
    // Already ready
    startPlayback();
  } else {
    // Wait until it's ready
    const onCanPlay = () => {
      audioPlayer.removeEventListener('canplay', onCanPlay);
      startPlayback();
    };
    audioPlayer.addEventListener('canplay', onCanPlay);
  }
};
