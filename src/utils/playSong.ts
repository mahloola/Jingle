import { RefObject } from 'react';
export const playSong = (
  audioRef: RefObject<HTMLAudioElement | null>,
  songName: string,
) => {
  const src = `https://mahloola.com/${songName.trim().replace(/ /g, '_')}.mp3`;
  audioRef.current!.src = src;
  audioRef.current!.load();
  audioRef.current!.play();
};
