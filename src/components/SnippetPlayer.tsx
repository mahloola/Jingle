import React, { RefObject, useEffect, useState } from 'react';
import { Button } from './ui-util/Button';
import { SongService } from '../utils/getRandomSong';
import { playSnippet } from '../utils/playSong';

//temporary styling
const SnippetPlayer = (props: {
  audioRef: RefObject<HTMLAudioElement | null>;
  songService: SongService;
}) => {
  const [isAudioReady, setIsAudioReady] = useState(false);

  useEffect(() => {
    const audio = props.audioRef.current;
    if (!audio) return;

    const handleCanPlay = () => setIsAudioReady(true);

    if (audio.readyState >= 3) {
      setIsAudioReady(true);
    } else {
      audio.addEventListener('canplay', handleCanPlay);
      return () => audio.removeEventListener('canplay', handleCanPlay);
    }
  }, [props.audioRef]);

  return (
  <div style={{display:'flex'}}>
    <div>
    <Button
      label="Play Snippet"
      onClick={() => playSnippet(props.audioRef, props.songService)}
      disabled={!isAudioReady}
    />
    </div>
    <VolumeControl audioRef={props.audioRef} />
  </div>
);
};

//temporary
const VolumeControl = (props: {audioRef : RefObject<HTMLAudioElement | null>}) => {
    
    return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div>🔊</div>
      <input
        style={{width: "5rem"}}
        type='range'
        min='0'
        max='1'
        step='0.01'
        onChange={(e) => {
          if (props.audioRef.current) {
            props.audioRef.current.volume = parseFloat(e.target.value);
          }
        }}
        defaultValue='1'
      />
    </div>
    );
}


export default SnippetPlayer;
