import { forwardRef, RefObject, useEffect, useState } from 'react';
import '../style/uiBox.css';
import { GameState, GameStatus } from '../types/jingle';
import { loadPreferencesFromBrowser } from '../utils/browserUtil';
import { SongService } from '../utils/getRandomSong';
import { playSnippet } from '../utils/playSong';
import { Button } from './ui-util/Button';

interface AudioControlsProps {
  gameState: GameState;
}

const AudioControls = forwardRef<HTMLAudioElement | null, AudioControlsProps>((props, ref) => {
  const currentPreferences = loadPreferencesFromBrowser();
  const answerRevealed = props.gameState.status == GameStatus.AnswerRevealed;
  const hardMode = currentPreferences.preferHardMode;
  const showAudio = !hardMode || answerRevealed;

  useEffect(() => {
    if (hardMode && answerRevealed) {
      const audioRef = ref as RefObject<HTMLAudioElement | null>;
      audioRef.current?.play();
    }
  }, [props.gameState.status]);
  const reloadAudio = () => {
    const audioRef = ref as RefObject<HTMLAudioElement | null>;
    audioRef.current?.load();
    audioRef.current?.play();
  };
  return (
    <div>
      <audio
        controls
        id='audio'
        ref={ref}
        className={showAudio ? '' : 'hide-audio'}
      />
      <button
        style={{ background: 'white' }}
        onClick={reloadAudio}
      >
        Reload Audio
      </button>

      {!showAudio && (
        <div>
          <SnippetPlayer
            audioRef={ref as RefObject<HTMLAudioElement | null>}
            snippetLength={currentPreferences.hardModeLength}
          />
        </div>
      )}
    </div>
  );
});

const SnippetPlayer = (props: {
  audioRef: RefObject<HTMLAudioElement | null>;
  snippetLength: number;
}) => {
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [isClipPlaying, setIsClipPlaying] = useState(false);
  const songService = SongService.Instance();
  const audio = props.audioRef.current;

  //is audio ready
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

  useEffect(() => {
    const audio = props.audioRef.current;
    if (!audio) return;

    const handlePause = () => setIsClipPlaying(false);
    const handlePlay = () => setIsClipPlaying(true);

    // Set initial state
    setIsClipPlaying(!audio.paused);

    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);

    return () => {
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
    };
  }, [props.audioRef]);

  return (
    <div
      className='osrs-btn'
      onClick={() => {
        if (!isAudioReady || isClipPlaying) {
          return;
        }
        playSnippet(props.audioRef, props.snippetLength);
      }}
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
          onClick={() => {}}
          classes={'guess-btn guess-btn-no-border'}
          disabled={!isAudioReady || isClipPlaying}
        />
      </div>
      <VolumeControl audioRef={props.audioRef} />
    </div>
  );
};

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

export default AudioControls;
