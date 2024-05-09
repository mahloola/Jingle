import React, { useState, useEffect } from 'react';

const AudioPlayer = ({ currentSong }) => {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [audio] = useState(new Audio());

  useEffect(() => {
    // Load the initial audio
    audio.src = currentSong;
    audio.load();

    return () => {
      // Cleanup when component unmounts
      audio.pause();
      audio.src = '';
    };
  }, [currentSong]);

//   const playNextTrack = () => {
//     const nextTrack = (currentTrack + 1) % audioList.length;
//     setCurrentTrack(nextTrack);
//   };

//   const playPreviousTrack = () => {
//     const previousTrack = (currentTrack - 1 + audioList.length) % audioList.length;
//     setCurrentTrack(previousTrack);
//   };

  const playPauseToggle = () => {
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  };

  return (
    <div>
      {/* <button onClick={playPreviousTrack}>Previous</button> */}
      <button onClick={playPauseToggle}>{audio.paused ? 'Play' : 'Pause'}</button>
      {/* <button onClick={playNextTrack}>Next</button> */}
    </div>
  );
};
export default AudioPlayer;
// Example usage
// const App = () => {
//   const audioList = [
//     'audio1.mp3',
//     'audio2.mp3',
//     'audio3.mp3'
//     // Add more audio URLs as needed
//   ];

//   return <AudioPlayer audioList={audioList} />;
// };

// export default App;