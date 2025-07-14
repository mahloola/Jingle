import { RefObject, useEffect, useState } from 'react';
import '../style/uiBox.css';
import { SongService } from '../utils/getRandomSong';
import { playSnippet } from '../utils/playSong';
import { Button } from './ui-util/Button';

const SnippetPlayer = (props: {
  audioRef: RefObject<HTMLAudioElement | null>;
  songService: SongService;
  snippetLength: number;
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
    <div
      className='osrs-btn'
      onClick={() => playSnippet(props.audioRef, props.songService, props.snippetLength)}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '40px',
        width: '300px',
      }}
    >
      <div className='snippet-player'>
        <Button
          label='Play Snippet'
          onClick={() => playSnippet(props.audioRef, props.songService, props.snippetLength)}
          classes={'guess-btn guess-btn-no-border'}
          disabled={!isAudioReady}
        />
      </div>
      <VolumeControl audioRef={props.audioRef} />
    </div>
  );
};

//temporary
const VolumeControl = (props: { audioRef: RefObject<HTMLAudioElement | null> }) => {
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div>🔊</div>
      <input
        style={{ width: '5rem' }}
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
};

export default SnippetPlayer;
