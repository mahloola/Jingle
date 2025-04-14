import { useState } from 'react';
import { FaQuestionCircle } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import useSWRImmutable from 'swr/immutable';
import { ASSETS } from '../../constants/assets';
import { getSongList } from '../../data/jingle-api';
import '../../style/modal.css';
import { Song } from '../../types/jingle';
import { loadPersonalStatsFromBrowser } from '../../utils/browserUtil';
import Modal from '../Modal';
import IconButton from './IconButton';

export default function StatsModalButton() {
  const [open, setOpen] = useState(false);
  const closeModal = () => {
    setOpen(false);
    setSearchString(''); // reset filter when modal is closed
  };

  const { correctGuessCount, incorrectGuessCount, maxStreak, currentStreak } =
    loadPersonalStatsFromBrowser();
  const totalGuessCount = correctGuessCount + incorrectGuessCount;
  const personalSuccessRate: number | undefined = !totalGuessCount
    ? undefined
    : parseFloat(
        (((correctGuessCount ?? 0) / totalGuessCount) * 100).toFixed(2)
      );

  const { data: songs } = useSWRImmutable<Song[]>('/api/songs', getSongList);
  const [searchString, setSearchString] = useState('');
  const successRate = (song: Song) =>
    (100 * song.successCount) / (song.successCount + song.failureCount);
  const sortedAndFilteredSongs =
    songs
      ?.filter((song) => Boolean(successRate(song)))
      ?.filter((song) =>
        searchString.trim()
          ? song.name.toLowerCase().includes(searchString.toLowerCase())
          : true
      )
      ?.sort((a, b) => successRate(b) - successRate(a)) ?? [];

  return (
    <>
      <IconButton onClick={() => setOpen(true)} img={ASSETS['stats']} />

      <Modal open={open} onClose={closeModal}>
        <img
          className='modal-bg-image'
          src='https://storage.googleapis.com/jingle-media/stats.png'
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2>Your Stats</h2>
          <span style={{ marginBottom: '10px' }}>
            <FaQuestionCircle
              data-tooltip-id='stats-tooltip'
              data-tooltip-content='Since Apr 7, 2025'
              className={'tooltip-icon'}
            />
            <Tooltip id='stats-tooltip' />
          </span>
        </div>

        <div className='modal-line'>
          <span>Songs Guessed</span>
          <span>{totalGuessCount}</span>
        </div>
        <div className='modal-line'>
          <span>Success Rate</span>
          <span>
            {personalSuccessRate === undefined
              ? 'Not Played'
              : `${personalSuccessRate}%`}
          </span>
        </div>
        <div className='modal-line'>
          <span>Current Streak</span>
          <span>{currentStreak}</span>
        </div>
        <div className='modal-line'>
          <span>Best Streak</span>
          <span>{maxStreak}</span>
        </div>
        <h2>Global Song%</h2>
        <input
          type='text'
          placeholder='🔍 Search for a song...'
          className='search-bar'
          value={searchString}
          onChange={(e) => setSearchString(e.target.value)}
        />

        <div style={{ width: '100%', padding: '6px 7px 6px 0' }}>
          <div className='song-stats'>
            {sortedAndFilteredSongs.map((song) => (
              <div className='modal-line' key={song.name}>
                <span>{song.name}</span>
                <span>{successRate(song).toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
}
