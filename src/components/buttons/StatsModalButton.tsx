import { useState } from 'react';
import { FaQuestionCircle } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import { ASSETS } from '../../constants/assets';
import '../../style/modal.css';
import { Song } from '../../types/jingle';
import { loadPersonalStatsFromBrowser } from '../../utils/browserUtil';
import Modal from '../Modal';
import IconButton from './IconButton';
import useSWR from 'swr';
import { getSongList } from '../../data/jingle-api';
import useSWRImmutable from 'swr/immutable';

interface StatsModalButtonProps {
  onClick: () => void;
  open: boolean;
  onClose: () => void;
}

export default function StatsModalButton({
  onClick,
  open,
  onClose,
}: StatsModalButtonProps) {
  const { correctGuessCount, incorrectGuessCount, maxStreak, currentStreak } =
    loadPersonalStatsFromBrowser();
  const totalGuessCount = correctGuessCount + incorrectGuessCount;
  const personalSuccessRate: number | undefined = !totalGuessCount
    ? undefined
    : parseFloat(
        (((correctGuessCount ?? 0) / totalGuessCount) * 100).toFixed(2),
      );

  const { data: songs } = useSWRImmutable<Song[]>('/api/songs', getSongList);
  const successRate = (song: Song) =>
    song.successCount / (song.successCount + song.failureCount);
  const sortedSongList =
    songs
      ?.sort((a, b) => successRate(b) - successRate(a))
      ?.filter((song) => Boolean(successRate(song))) ?? [];
  const [filteredStats, setFilteredStats] = useState<Song[] | undefined>(
    undefined,
  );
  const statsToDisplay = filteredStats ?? sortedSongList;

  return (
    <>
      <IconButton onClick={onClick} img={ASSETS['stats']} />

      <Modal
        open={open}
        onClose={() => {
          onClose();
          setFilteredStats(undefined); // reset filter when modal is closed
        }}
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
          onChange={(e) => {
            const searchTerm = e.target.value.toLowerCase();
            setFilteredStats(
              stats.filter((song) =>
                song.name.toLowerCase().includes(searchTerm),
              ),
            );
          }}
        />

        <div className='song-stats'>
          {statsToDisplay.map((song) => (
            <div className='modal-line' key={song.name}>
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
