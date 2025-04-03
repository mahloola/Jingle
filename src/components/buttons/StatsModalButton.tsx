import { useState } from 'react';
import { ASSETS } from '../../constants/assets';
import '../../style/modal.css';
import { GameState, Song } from '../../types/jingle';
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
  const localStorageKeys = Object.keys(localStorage);
  const gameStateKeys = localStorageKeys.filter((key) =>
    key.includes('jingle-'),
  );
  const gameStateObjects = gameStateKeys.map((key) => {
    const gameState: GameState | null = JSON.parse(
      localStorage.getItem(key) ?? '{}',
    );
    // todo: retrieve stats from local storage gamestate
  });

  const [filteredStats, setFilteredStats] = useState<Song[]>(stats);
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
        <h2>Your Stats</h2>
        <div className='modal-line'>
          <span>Dailies Played</span>
          <span>100</span>
        </div>
        <div className='modal-line'>
          <span>Success Rate</span>
          <span>19.37%</span>
        </div>
        <div className='modal-line'>
          <span>Best Streak</span>
          <span>32</span>
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
