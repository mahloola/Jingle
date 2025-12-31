import { forwardRef, RefObject, useEffect, useState } from 'react';
import { FiRefreshCcw } from 'react-icons/fi';
import { Tooltip } from 'react-tooltip';
import '../style/uiBox.css';
import { MultiGameState, MultiLobby, MultiLobbyStatus } from '../types/jingle';
import { SongService } from '../utils/getRandomSong';
import { playSnippet } from '../utils/playSong';
import { Button } from './ui-util/Button';

interface AudioControlsMultiProps {
  gameState: MultiGameState;
  multiGame: MultiLobby;
}

const AudioControlsMulti = forwardRef<HTMLAudioElement | null, AudioControlsMultiProps>(
  (props, ref) => {
    const gameSettings = props.multiGame.settings;
    const answerRevealed =
      props.gameState.status == MultiLobbyStatus.Revealing || MultiLobbyStatus.Playing;
    const hardMode = gameSettings.hardMode == true;
    const showAudio = !hardMode || answerRevealed;
    const audioRef = ref as RefObject<HTMLAudioElement | null>;

    useEffect(() => {
      if (hardMode && answerRevealed) {
        audioRef.current?.play();
      }
    }, [props.gameState.status]);

    const reloadAudio = () => {
      const audioRef = ref as RefObject<HTMLAudioElement | null>;
      audioRef.current?.load();
      audioRef.current?.play();
    };

    return (
      <div className='audio-container'>
        <audio
          controls
          id='audio'
          ref={ref}
          className={showAudio ? '' : 'hide-audio'}
        />

        {/* non-hard mode */}
        {showAudio && (
          <div className='reload-audio-container'>
            <FiRefreshCcw
              className={'reload-audio-btn'}
              onClick={reloadAudio}
              data-tooltip-id={`reload-tooltip`}
              data-tooltip-content={'Reload Audio'}
            />
            <Tooltip id={`reload-tooltip`} />
          </div>
        )}

        {/* hard mode */}
        {!showAudio && (
          <div className='audio-container'>
            <SnippetPlayer
              audioRef={ref as RefObject<HTMLAudioElement | null>}
              snippetLength={gameSettings.hardModeLength}
            />
            <div className='reload-audio-container'>
              <FiRefreshCcw
                className={'reload-audio-btn'}
                onClick={() => playSnippet(audioRef, gameSettings.hardModeLength)}
                data-tooltip-id={`reload-tooltip`}
                data-tooltip-content={'Reload Audio'}
              />
              <Tooltip id={`reload-tooltip`} />
            </div>
          </div>
        )}
      </div>
    );
  },
);

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

export default AudioControlsMulti;
