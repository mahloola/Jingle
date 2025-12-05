import { FaDiscord, FaDonate, FaGithub } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import { cdnURL } from '../constants/links';
import { LOCAL_STORAGE } from '../constants/localStorage';
import { getStatistics } from '../data/jingle-api';
import '../style/mainMenu.css';
import { DailyChallenge } from '../types/jingle';
import { getCurrentDateInBritain, getNextUkMidnight } from '../utils/date-utils';
import NextDailyCountdown from './NextDailyCountdown';

interface MainMenuProps {
  dailyChallenge: DailyChallenge | undefined;
}
export default function MainMenu({ dailyChallenge }: MainMenuProps) {
  const dailyCompleted =
    localStorage.getItem(LOCAL_STORAGE.dailyComplete) === getCurrentDateInBritain();

  const { data: statistics } = useSWR('/api/statistics', getStatistics, {
    refreshInterval: 2000,
  });

  const leftSideStyle = { left: '17vw', top: '70%' };

  return (
    <div className='main-menu-container'>
      <img
        className='main-menu-image'
        src={`${cdnURL}/Jingle.png`}
        alt='Jingle'
      />

      <h1 className='main-menu-text'>Jingle</h1>

      {/* Daily Jingle Option */}
      {dailyChallenge ? (
        <Link
          to='/daily'
          className='main-menu-option'
          style={leftSideStyle}
        >
          Daily Jingle
          {dailyCompleted && <NextDailyCountdown end={getNextUkMidnight()} />}
          {!dailyCompleted && <div style={{ color: '#00FF00' }}>Ready</div>}{' '}
          <div style={{ fontSize: '40%' }}>
            {dailyChallenge?.results.length.toLocaleString()} Completions
          </div>
        </Link>
      ) : (
        <h1
          className='main-menu-option'
          style={leftSideStyle}
        >
          Loading...
        </h1>
      )}

      <Link
        to='/practice'
        className='main-menu-option'
        style={{ left: '53vw', top: '70%' }}
      >
        Unlimited Practice
        <div style={{ fontSize: '40%' }}>∞</div>
      </Link>

      <div className='menu-statistics'>
        <div>
          {statistics?.guesses.toLocaleString()}
          <div style={{ fontSize: '65%', marginTop: '-7%' }}>Global Guesses</div>
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
      </div>
    </div>
  );
}
