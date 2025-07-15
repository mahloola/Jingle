import { RefObject } from 'react';
import { audio2004 } from '../data/audio2004';
import { SongService } from './getRandomSong';

export const playSong = (
  audioRef: RefObject<HTMLAudioElement | null>,
  songName: string,
  oldAudio: boolean,
  hardModeLength?: number,
) => {
  let src;
  const songService = SongService.Instance();
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

  if (hardModeLength && songService) {
    songService.resetSnippet();
    playSnippet(audioRef, hardModeLength);
  } else {
    audioRef.current!.play();
  }
};

export const playSnippet = (audioRef: RefObject<HTMLAudioElement | null>, length: number) => {
  const audioPlayer = audioRef.current;
  const songService = SongService.Instance();
  if (!audioPlayer) return;

  const startPlayback = () => {
    const [start, end] = songService.getSnippet(audioRef, length)!;

    const stopTime = () => {
      if (audioPlayer.currentTime >= end) {
        audioPlayer.removeEventListener('timeupdate', stopTime);
        audioPlayer.pause();
        audioPlayer.currentTime = start;
      }
    };

    audioPlayer.addEventListener('timeupdate', stopTime);
    audioPlayer.currentTime = start;
    audioPlayer.play();
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
