import Chip from '@mui/material/Chip';
import { Fragment, useState } from 'react';
import { FaChevronDown, FaQuestionCircle } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import useSWR from 'swr';
import { ASSETS } from '../../constants/assets';
import { MAX_MIN_HISTORY_COLORS } from '../../constants/defaults';
import { getAverages } from '../../data/jingle-api';
import '../../style/modal.css';
import Modal from '../Modal';
import IconButton from './IconButton';

const HistoryModalButton = () => {
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: averages } = useSWR(`/api/averages`, getAverages);

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

  const calcDailyAvgColor = (val: number): string => {
    const [max, min] = MAX_MIN_HISTORY_COLORS;
    const normalized = Math.min(Math.max((val - min) / (max - min), 0), 1);

    // RGB values for our gradient stops
    const colors = [
      { r: 255, g: 0, b: 0 },
      { r: 237, g: 253, b: 7 }, // Yellow at 0.5
      { r: 0, g: 255, b: 0 },
    ];

    let r, g, b;

    if (normalized <= 0.5) {
      // Between green and yellow
      const ratio = normalized * 2;
      r = Math.round(colors[0].r + (colors[1].r - colors[0].r) * ratio);
      g = Math.round(colors[0].g + (colors[1].g - colors[0].g) * ratio);
      b = Math.round(colors[0].b + (colors[1].b - colors[0].b) * ratio);
    } else {
      // Between yellow and red
      const ratio = (normalized - 0.5) * 2;
      r = Math.round(colors[1].r + (colors[2].r - colors[1].r) * ratio);
      g = Math.round(colors[1].g + (colors[2].g - colors[1].g) * ratio);
      b = Math.round(colors[1].b + (colors[2].b - colors[1].b) * ratio);
    }

    return `rgb(${r}, ${g}, ${b})`;
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
          <span style={{ marginBottom: '10px' }}>
            <FaQuestionCircle
              data-tooltip-id='stats-tooltip'
              data-tooltip-content='Since Apr 7, 2025'
              className={'tooltip-icon'}
            />
            <Tooltip id='stats-tooltip' />
          </span>
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
          <span>Jingles Completed</span>
          <span>{dailiesAsObjects.length}</span>
        </div>
        <div className='modal-line'>
          <span>Avg Score</span>
          <span>{dailyAvg ? dailyAvg.toFixed(0) : '-'}</span>
        </div>
        <p />
        <h2>By Day</h2>
        {dailiesAsObjects.length ? (
          <table>
            <thead>
              <tr className='history-entry-row'>
                <td
                  className='history-entry-td'
                  style={{ color: 'var(--primary-yellow-dark)' }}
                >
                  Jingle
                </td>
                <td
                  className='history-entry-td'
                  style={{ color: 'var(--primary-yellow-dark)' }}
                >
                  Personal
                </td>
                <td
                  className='history-entry-td'
                  style={{ color: 'var(--primary-yellow-dark)' }}
                >
                  Glob. Avg
                </td>
                <td
                  className='history-entry-td'
                  style={{ color: 'var(--primary-yellow-dark)' }}
                >
                  Date
                </td>
              </tr>
            </thead>
            <tbody className='history-stats'>
              {dailiesAsObjects.map((dailyObject: any) => {
                const dateString = dailyObject.value?.startTime
                  ? new Date(dailyObject.value.startTime).toISOString().split('T')[0] // yyyy-mm-dd
                  : '';

                const formattedDate = dailyObject.value?.startTime
                  ? new Date(dailyObject.value.startTime).toLocaleDateString()
                  : '';

                const dailyKey = dailyObject.key;
                const isExpanded = expandedId === dailyKey;
                const dailyAvg = averages ? averages[dateString] : '-';
                const score = dailyObject.value?.scores?.reduce((a: number, b: number) => a + b);

                return (
                  <Fragment key={dailyKey}>
                    <tr className='history-entry-row'>
                      <td className='history-entry-td'>
                        #{dailyObject.dailyNumber}
                        <FaChevronDown
                          onClick={() => toggleDaily(dailyKey)}
                          className={isExpanded ? 'rotated' : ''}
                          pointerEvents={'auto'}
                        />
                      </td>
                      <td className='history-entry-td'>
                        {dailyObject.value?.timeTaken && (
                          <Chip
                            size='small'
                            label={`👤 ${score ?? 'N/A'}`}
                            style={{ color: calcDailyAvgColor(score) }}
                          />
                        )}
                      </td>
                      {/* time taken - maybe bring it later some time */}
                      {/* <td className='history-entry-td'>
                        {dailyObject.value?.timeTaken && (
                          <Chip
                            size='small'
                            label={`⏱️ ${formatTimeTaken(dailyObject.value?.timeTaken)}`}
                            style={{ color: 'var(--primary-yellow-light' }}
                          />
                        )}
                      </td> */}
                      <td className='history-entry-td'>
                        {' '}
                        {dailyAvg && (
                          <Chip
                            size='small'
                            label={`🌍 ${dailyAvg || 'N/A'}`}
                            style={{ color: calcDailyAvgColor(dailyAvg) }}
                          />
                        )}
                      </td>
                      <td className='history-entry-td'>
                        {' '}
                        {formattedDate && (
                          <Chip
                            size='small'
                            label={formattedDate}
                            style={{ color: 'var(--primary-yellow)' }}
                          />
                        )}
                      </td>
                    </tr>
                    <div
                      style={{
                        minHeight: isExpanded ? '130px' : '0px',
                        margin: isExpanded ? '5px 15px' : '0px 15px',
                        padding: isExpanded ? '5px 0px' : '0px',
                      }}
                      className='history-stats-entry'
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
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p>No data yet, maybe try playing a daily challenge first?</p>
        )}
      </Modal>
    </div>
  );
};

export default HistoryModalButton;
