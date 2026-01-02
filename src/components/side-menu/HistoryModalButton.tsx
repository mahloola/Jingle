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
import { calcGradientColor } from '../../utils/string-utils';
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

  const [max, min] = MAX_MIN_HISTORY_COLORS;
  return (
    <div>
      <IconButton
        onClick={() => setOpen(true)}
        img={ASSETS['historyIcon']}
      ></IconButton>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        primaryButtonText='Save'
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
              data-tooltip-content='Since Apr 7, 2025 (taken from your local browser storage)'
              className={'tooltip-icon'}
            />
            <Tooltip id='stats-tooltip' />
          </span>
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
                const startTime = dailyObject.value?.startTime ?? dailyObject.value?.startTimeMs;
                const dateString = startTime ? new Date(startTime).toISOString().split('T')[0] : '';

                const formattedDate = dateString ? new Date(dateString).toLocaleDateString() : '';

                const dailyKey = dailyObject.key;
                const isExpanded = expandedId === dailyKey;
                const dailyAvg = averages ? averages[dateString] : null;
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
                        {score && (
                          <Chip
                            size='small'
                            label={`👤 ${score ?? 'N/A'}`}
                            style={{ color: calcGradientColor({ val: score, min, max }) }}
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
                            label={`🌍 ${dailyAvg || '-'}`}
                            style={{ color: calcGradientColor({ val: score, min, max }) }}
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
