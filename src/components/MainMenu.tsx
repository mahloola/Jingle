import { Link } from 'react-router-dom';
import useSWR from 'swr';
import { cdnURL } from '../constants/links';
import { LOCAL_STORAGE } from '../constants/localStorage';
import { getStatistics } from '../data/jingle-api';
import '../style/mainMenu.css';
import { DailyChallenge } from '../types/jingle';
import { getCurrentDateInBritain, getNextUkMidnight } from '../utils/date-utils';
import Links from './Links';
import Navbar from './Navbar/Navbar';
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
    <>
      <Navbar />
      <div className='main-menu-container'>
        <img
          className='main-menu-image'
          src={`${cdnURL}/Jingle.png`}
          alt='Jingle'
        />
        <div className='main-menu-title-options'>
          <h1 className={'main-menu-text'}>
            <span className={'jLetter'}>
              J<span className={'santaHat'}></span>
            </span>
            ingle
          </h1>
          {/* Daily Jingle Option */}
          <div className='main-menu-options'>
            <Link
              to='/practice'
              className='main-menu-option'
            >
              <div style={{ lineHeight: '1.0' }}>Practice Mode</div>
              <div style={{ fontSize: '40%' }}>∞</div>
            </Link>

            <Link
              to='/multiplayer'
              className='main-menu-option'
            >
              <div style={{ lineHeight: '1.0' }}>
                Multiplayer<span style={{ color: '#c7c3f8ff', fontSize: '2rem' }}> (Beta)</span>
              </div>

              <div style={{ fontSize: '40%' }}>4 Lobbies</div>
            </Link>

            {dailyChallenge ? (
              <Link
                to='/daily'
                className='main-menu-option'
                style={leftSideStyle}
              >
                <div style={{ lineHeight: '1.0' }}>Daily Jingle</div>
                {dailyCompleted && <NextDailyCountdown end={getNextUkMidnight()} />}
                {!dailyCompleted && (
                  <div style={{ color: '#00FF00', fontSize: '2rem' }}>Ready</div>
                )}{' '}
                <div style={{ fontSize: '40%' }}>
                  {dailyChallenge?.results?.length?.toLocaleString()} Completions
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
          </div>
        </div>
        <div className='menu-statistics'>
          <div>
            {statistics?.guesses.toLocaleString()}
            <div style={{ fontSize: '65%', marginTop: '-7%' }}>Global Guesses</div>
          </div>
        </div>
        <Links />
      </div>
    </>
  );
}
