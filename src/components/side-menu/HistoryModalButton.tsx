import Chip from '@mui/material/Chip';
import { useState } from 'react';
import { FaChevronDown, FaQuestionCircle } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { ASSETS } from '../../constants/assets';
import '../../style/modal.css';
import Modal from '../Modal';
import IconButton from './IconButton';

const HistoryModalButton = () => {
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const localStorageItems = { ...localStorage };
  const dailies = Object.entries(localStorageItems).filter(([key]) => key.includes('jingle-'));
  const dailiesAsObjects = dailies.map(([key, value]) => ({
    key,
    value: JSON.parse(value),
    dailyNumber: parseInt(key.match(/\d+/)?.[0] || '0'),
  }));

  let dailyTotal = 0;
  for (const daily of dailiesAsObjects) {
    let songTotal = 0;
    for (const score of daily.value.scores) {
      songTotal += parseInt(score);
    }
    dailyTotal += songTotal;
  }
  const dailyAvg = dailyTotal / dailiesAsObjects.length;

  dailiesAsObjects.sort((a, b) => b.dailyNumber - a.dailyNumber);

  const toggleDaily = (key: string) => {
    setExpandedId((prev) => {
      if (prev == key) return null;
      return key;
    });
  };

  const calcDailyAvgColor = (val: number, min: number, max: number) => {
    const normalized = (val - min) / (max - min);
    let r, g, b;
  };
  return (
    <div>
      <IconButton
        onClick={() => setOpen(true)}
        img={ASSETS['historyIcon']}
      ></IconButton>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
      >
        <img
          className='modal-bg-image'
          src={ASSETS['historyIcon']}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2>History</h2>
          {dailiesAsObjects.length == 0 && (
            <span style={{ marginBottom: '10px' }}>
              <FaQuestionCircle
                className='tooltip-icon'
                data-tooltip-id='history-tooltip'
                data-tooltip-content='Local storage taken from your browser'
              />
              <Tooltip id='history-tooltip' />
            </span>
          )}
        </div>

        <div className='modal-line'>
          <span>Dailies Completed</span>
          <span>{dailiesAsObjects.length}</span>
        </div>
        <div className='modal-line'>
          <span>Daily Avg</span>
          <span>{dailyAvg ? dailyAvg.toFixed(0) : '-'}</span>
        </div>
        <p />
        <h2>By Day</h2>
        <div className='modal-line'>
          <span style={{ color: 'var(--primary-color-dark)' }}>Challenge Number</span>
          <span style={{ color: 'var(--primary-color-dark)', paddingRight: '13px' }}>Date</span>
        </div>
        {dailiesAsObjects.length ? (
          <section className='history-stats'>
            {dailiesAsObjects.map((dailyObject: any) => (
              <>
                <div
                  className='modal-line'
                  style={{ paddingRight: '5px', lineHeight: '2.2' }}
                >
                  <span>
                    #{dailyObject.dailyNumber}
                    <FaChevronDown
                      onClick={() => toggleDaily(dailyObject.key)}
                      className={expandedId == dailyObject.key ? 'rotated' : ''}
                      pointerEvents={'auto'}
                    />{' '}
                    {dailyObject.value?.timeTaken && (
                      <Chip
                        size='small'
                        label={dailyObject.value?.timeTaken}
                        style={{ color: 'var(--primary-yellow' }}
                      />
                    )}
                    {dailyObject.value?.settings?.hardMode && (
                      <Chip
                        size='small'
                        label='Hard'
                        style={{ color: '#fe8585ff' }}
                      />
                    )}
                  </span>
                  <span>
                    <span>
                      {dailyObject.value.startTime && (
                        <Chip
                          size='small'
                          label={new Date(dailyObject.value.startTime).toLocaleDateString()}
                          style={{ color: 'var(--primary-yellow)' }}
                        />
                      )}
                    </span>
                  </span>
                </div>
                {expandedId == dailyObject.key && (
                  <div
                    style={{
                      margin: '5px 15px',
                      marginLeft: '0px',
                      padding: '5px 0px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '5px',
                      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                      backdropFilter: 'blur(5px)',
                      WebkitBackdropFilter: 'blur(5px)',
                    }}
                  >
                    {dailyObject.value.songs.map((song: string) => (
                      <div
                        key={song}
                        className='modal-line'
                        style={{ padding: '0px 15px', lineHeight: '1.5' }}
                      >
                        <span>{song}</span>
                        <span>
                          {dailyObject.value.scores[dailyObject.value.songs.indexOf(song)] ?? '-'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ))}
          </section>
        ) : (
          <p>No data yet, maybe try playing a daily challenge first?</p>
        )}
      </Modal>
    </div>
  );
};

export default HistoryModalButton;
