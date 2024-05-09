import React, { useState, useEffect, useRef } from 'react';
import { getRandomSong } from '../utils/getSong';

const AudioPlayer = () => {
  const audioRef = useRef(undefined);
  const [playClicked, setPlayClicked] = useState(false);

  useEffect(() => {
    const audio = new Audio();
    const randomSong = getRandomSong();
    const src = `https://oldschool.runescape.wiki/images/${randomSong
      .trim()
      .replaceAll(" ", "_")}.ogg`;
    audio.src = src;
    audio.load();
    audioRef.current = audio;
  }, []);

  const playNextTrack = () => {
    const randomSong = getRandomSong();
    const src = `https://oldschool.runescape.wiki/images/${randomSong
      .trim()
      .replaceAll(" ", "_")}.ogg`;
    audioRef.current.src = src;
    audioRef.current.load();
    audioRef.current.play();
  };

  const play = () => {
    audioRef.current.play();
    setPlayClicked(true);
  };

  return (
    <div>
      {!playClicked && <button onClick={play}>Play</button>}
      <button onClick={playNextTrack}>Next</button>
    </div>
  );
};

export default AudioPlayer;