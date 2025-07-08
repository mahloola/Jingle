'use client';

import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface AudioPlayerProps {
  src: string;
  startTime?: number; // in seconds
  duration?: number; // in milliseconds
  loop?: boolean;
  className?: string;
  playbarClassName?: string;
  controlsClassName?: string;
}

export function AudioPlayer({
  src,
  startTime = 0,
  duration,
  loop = false,
  className,
  playbarClassName,
  controlsClassName,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(startTime);
  const [audioDuration, setAudioDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // Calculate end time based on duration
  const endTime = duration ? startTime + duration / 1000 : undefined;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Set initial properties
    audio.currentTime = startTime;
    audio.loop = loop;
    audio.volume = volume;

    // Set up event listeners
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);

      // If duration is specified and we've reached the end time, reset to start time
      if (endTime && audio.currentTime >= endTime) {
        audio.currentTime = startTime;
        if (!loop) {
          audio.pause();
          setIsPlaying(false);
        }
      }
    };

    const handleLoadedMetadata = () => {
      setAudioDuration(audio.duration);
    };

    const handleEnded = () => {
      if (!loop) {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [startTime, loop, endTime, volume]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSliderChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = value[0];
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = value[0];
    audio.volume = newVolume;
    setVolume(newVolume);

    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume || 1;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const resetAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = startTime;
    setCurrentTime(startTime);

    if (!isPlaying) {
      audio.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Calculate the slider range based on the specified duration
  const sliderMax = endTime || audioDuration;
  const sliderMin = startTime;

  return (
    <div
      className={cn(
        'flex flex-col w-full max-w-md rounded-lg bg-background p-4 shadow-md',
        className,
      )}
    >
      <audio
        ref={audioRef}
        src={src}
        preload='metadata'
      />

      <div className={cn('flex items-center space-x-2 mb-2', playbarClassName)}>
        <span className='text-xs text-muted-foreground w-10 text-right'>
          {formatTime(currentTime)}
        </span>
        <Slider
          value={[currentTime]}
          min={sliderMin}
          max={sliderMax}
          step={0.01}
          onValueChange={handleSliderChange}
          className='flex-1'
        />
        <span className='text-xs text-muted-foreground w-10'>
          {formatTime(endTime || audioDuration)}
        </span>
      </div>

      <div className={cn('flex items-center justify-between', controlsClassName)}>
        <div className='flex items-center space-x-2'>
          <button
            onClick={togglePlayPause}
            className='p-2 rounded-full hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary'
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>

          <button
            onClick={resetAudio}
            className='p-2 rounded-full hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary'
            aria-label='Reset'
          >
            <RotateCcw size={18} />
          </button>
        </div>

        <div
          className='relative flex items-center space-x-2'
          onMouseEnter={() => setShowVolumeSlider(true)}
          onMouseLeave={() => setShowVolumeSlider(false)}
        >
          <button
            onClick={toggleMute}
            className='p-2 rounded-full hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary'
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          {showVolumeSlider && (
            <div className='absolute bottom-full left-0 p-2 bg-background shadow-md rounded-md mb-2 w-32'>
              <Slider
                value={[isMuted ? 0 : volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
