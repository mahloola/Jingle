import { RefObject } from 'react';
import { audio2004 } from '../data/audio2004';

export const playSong = (
  audioRef: RefObject<HTMLAudioElement | null>,
  songName: string,
  oldAudio: boolean,
  hardMode: boolean,
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
  audioRef.current!.play();

  if (hardMode) {
    setTimeout(() => {
      audioRef.current!.pause();
      audioRef.current!.currentTime = 0;
    }, 3000);
  }
};
