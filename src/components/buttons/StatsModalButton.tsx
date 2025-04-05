import { useEffect, useState } from 'react';
import { FaQuestionCircle } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import { ASSETS } from '../../constants/assets';
import '../../style/modal.css';
import { Song } from '../../types/jingle';
import { loadPersonalStatsFromBrowser } from '../../utils/browserUtil';
import Modal from '../Modal';
import IconButton from './IconButton';

interface StatsModalButtonProps {
  onClick: () => void;
  open: boolean;
  onClose: () => void;
  stats: Song[];
}

export default function StatsModalButton({
  onClick,
  open,
  onClose,
  stats,
}: StatsModalButtonProps) {
  const { correctGuessCount, incorrectGuessCount, maxStreak, currentStreak } =
    loadPersonalStatsFromBrowser();
  const totalGuessCount = correctGuessCount + incorrectGuessCount;
  const personalSuccessRate: number = parseFloat(
    ((correctGuessCount / totalGuessCount) * 100).toFixed(2),
  );

  const [filteredStats, setFilteredStats] = useState<Song[]>([]);

  // Update filteredStats whenever stats updates
  useEffect(() => {
    if (stats) {
      setFilteredStats(stats);
    }
  }, [stats]);

  return (
    <>
      <IconButton
        onClick={onClick}
        img={ASSETS['stats']}
      />

      <Modal
        open={open}
        onClose={onClose}
      >
        <img
          className='modal-bg-image'
          src='https://storage.googleapis.com/jingle-media/stats.png'
        ></img>
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
              data-tooltip-content='Since Apr 4, 2025'
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
            {!personalSuccessRate ? 'Not Played' : `${personalSuccessRate}%`}
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
          onChange={(e) => {
            const searchTerm = e.target.value.toLowerCase();
            setFilteredStats(
              stats.filter((song) =>
                song.name.toLowerCase().includes(searchTerm),
              ),
            );
            // update the stats to show only the filtered stats
          }}
        />
        <div className='song-stats'>
          {filteredStats.map((song) => (
            <div
              className='modal-line'
              key={song.name}
            >
              <span>{song.name}</span>
              <span>
                {(
                  (song.successCount /
                    (song.successCount + song.failureCount)) *
                  100
                ).toFixed(2)}
                %
              </span>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}
