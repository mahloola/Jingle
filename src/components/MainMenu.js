import React from 'react';
import { FaDiscord, FaDonate, FaEnvelope, FaGithub } from 'react-icons/fa';
import { mediaHostUrl } from '../data/hostUrl';
import { getStatistics } from '../db/db';
import '../style/footer.css';
import '../style/mainMenu.css';
import getCurrentDateInBritain from '../utils/getCurrentDateinBritain';
import Countdown from './Countdown';

export default function MainMenu({
  setDailyComplete,
  setResultsArray,
  setTimeTaken,
  setStartedGame,
  setStartTime,
  setCurrentSong,
  currentSong,
  playSong,
  dailyChallenge,
  setDailyMode,
  dailyComplete,
}) {
  const [guessCount, setGuessCount] = React.useState(0);
  const fetchPost = async () => {
    getStatistics().then((response) => {
      const guesses = response.guesses;
      setGuessCount(guesses);
    });
  };
  React.useEffect(() => {
    const interval = setInterval(() => {
      fetchPost();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    fetchPost();
  }, []);

  return (
    <div className='main-menu-container'>
      <img
        className='main-menu-image'
        src={`${mediaHostUrl}/Jingle.png`}
        alt='Jingle'
      />

      <h1 className='main-menu-text'>Jingle</h1>

      {/* Daily Jingle Option */}
      <h1
        className='main-menu-option'
        style={{ left: '17vw', top: '70%' }}
        onClick={() => {
          if (localStorage?.dailyComplete === getCurrentDateInBritain()) {
            setDailyComplete(true);
            setResultsArray(JSON.parse(localStorage.dailyResults));
            setTimeTaken(localStorage.dailyTimeTaken);
          }
          if (dailyComplete) {
            setStartedGame(true);
            return;
          } else {
            setStartTime(new Date());
            setStartedGame(true);
            setCurrentSong(dailyChallenge.songs[0]);
            playSong(dailyChallenge.songs[0]);
            setDailyMode(true);
          }
        }}
      >
        Daily Jingle
        <Countdown style={{ color: 'orange' }} />
        <div style={{ fontSize: '40%' }}>
          {dailyChallenge.results.length.toLocaleString()} Completions
        </div>
      </h1>
      <h1
        className='main-menu-option'
        style={{ left: '53vw', top: '70%' }}
        onClick={() => {
          setStartedGame(true);
          playSong(currentSong);
        }}
      >
        Unlimited Practice
        <div style={{ fontSize: '40%' }}>∞</div>
      </h1>
      <div className='menu-statistics'>
        <div>
          {guessCount.toLocaleString()}
          <div style={{ fontSize: '65%', marginTop: '-7%' }}>
            Global Guesses
          </div>
        </div>
      </div>
      <div className='main-menu-icon-container'>
        <a
          className='main-menu-icon'
          href='https://github.com/mahloola/osrs-music'
          target='_blank'
          rel='noopener noreferrer'
        >
          <FaGithub />
        </a>
        <a
          className='main-menu-icon'
          href='https://discord.gg/7sB8fyUS9W'
        >
          <FaDiscord />
        </a>
        <a
          className='main-menu-icon'
          href='https://ko-fi.com/mahloola'
        >
          <FaDonate />
        </a>
        <a
          className='main-menu-icon'
          href='mailto:mahloola08@gmail.com'
        >
          <FaEnvelope />
        </a>
      </div>
    </div>
  );
}
