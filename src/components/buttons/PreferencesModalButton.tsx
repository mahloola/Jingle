import React, { useState } from 'react';
import { FaQuestionCircle } from 'react-icons/fa';
import { FaChevronDown } from 'react-icons/fa6';
import { IoWarning } from 'react-icons/io5';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { ASSETS } from '../../constants/assets';
import { Region, REGIONS } from '../../constants/regions';
import { COLORS } from '../../constants/theme';
import '../../style/modal.css';
import { Page, UserPreferences } from '../../types/jingle';
import Modal from '../Modal';
import IconButton from './IconButton';

interface PreferencesModalButtonProps {
  currentPreferences: UserPreferences;
  onApplyPreferences: (settings: any) => void;
  page: Page.DailyJingle | Page.Practice;
}

export default function SettingsModalButton({
  currentPreferences,
  onApplyPreferences,
  page,
}: PreferencesModalButtonProps) {
  const [open, setOpen] = useState(false);

  const [preferences, setPreferences] = useState(currentPreferences);
  const [regionsOpen, setRegionsOpen] = useState(false);
  const toggleRegions = () => {
    setRegionsOpen((prev) => !prev);
  };

  const disabled =
    JSON.stringify(currentPreferences) === JSON.stringify(preferences) ||
    Object.values(preferences.regions).every((enabled) => !enabled);

  const handlePreferencesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    if (name.startsWith('regions.')) {
      const region = name.split('.')[1] as Region;
      setPreferences((prev: UserPreferences) => ({
        ...prev,
        regions: {
          ...prev.regions,
          [region]: checked,
        },
      }));
    } else {
      setPreferences((prev: UserPreferences) => ({
        ...prev,
        [name]: checked,
      }));
    }
  };

  return (
    <>
      <IconButton onClick={() => setOpen(true)} img={ASSETS['settingsIcon']} />
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        onApplySettings={() => onApplyPreferences(preferences)}
        saveDisabled={disabled}
      >
        <img
          className='modal-bg-image'
          src={ASSETS['settingsIcon']}
          style={{ width: '100px' }}
        />
        <h2>Settings</h2>
        <table className={'settings-table'}>
          <tbody>
            <tr>
              <td>
                Hard Mode{' '}
                <FaQuestionCircle
                  data-tooltip-id='hard-mode-tooltip'
                  data-tooltip-content='The music auto-pauses after 2 seconds'
                />
                <Tooltip id='hard-mode-tooltip' />
              </td>
              <td>
                <input
                  type='checkbox'
                  name='preferHardMode'
                  defaultChecked={preferences.preferHardMode}
                  onChange={(e) => {
                    handlePreferencesChange(e);
                  }}
                ></input>
              </td>
            </tr>
            <tr>
              <td>
                2004 Audio{' '}
                <FaQuestionCircle
                  data-tooltip-id='old-audio-tooltip'
                  data-tooltip-content='Play 2004 mp3 alternatives when available'
                />
                <Tooltip id='old-audio-tooltip' />
              </td>
              <td>
                <input
                  type='checkbox'
                  name='preferOldAudio'
                  defaultChecked={preferences.preferOldAudio}
                  onChange={(e) => {
                    handlePreferencesChange(e);
                  }}
                ></input>
              </td>
            </tr>
            <tr>
              <td>
                Confirmation{' '}
                <FaQuestionCircle
                  data-tooltip-id='confirmation-tooltip'
                  data-tooltip-content='Require confirmation while guessing songs'
                />
                <Tooltip id='confirmation-tooltip' />
              </td>
              <td>
                <input
                  type='checkbox'
                  name='preferConfirmation'
                  defaultChecked={preferences.preferConfirmation}
                  onChange={(e) => {
                    handlePreferencesChange(e);
                  }}
                ></input>
              </td>
            </tr>
            <tr>
              <td>
                Regions{' '}
                <FaChevronDown
                  onClick={toggleRegions}
                  className={regionsOpen ? 'rotated' : ''}
                  pointerEvents={page !== Page.Practice ? 'none' : 'auto'}
                />
                {page !== Page.Practice && (
                  <>
                    <IoWarning
                      style={{
                        color: COLORS.yellow,
                        minHeight: '20px',
                        minWidth: '20px',
                      }}
                      data-tooltip-id='regions-tooltip'
                      data-tooltip-content='You must be in practice mode to set regions'
                    />
                    <Tooltip id='regions-tooltip' />
                  </>
                )}
              </td>
            </tr>
          </tbody>
        </table>
        {page === Page.Practice && (
          <div
            className={'regions-table'}
            style={{
              height: regionsOpen ? '200px' : '0px',
            }}
          >
            {Object.keys(REGIONS).map((region) => (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  minWidth: '130px',
                }}
                key={region}
              >
                <div>
                  {region} ({REGIONS[region as Region].length})
                </div>
                <div>
                  <input
                    type='checkbox'
                    name={`regions.${region}`}
                    disabled={(page as Page) === Page.DailyJingle}
                    checked={preferences.regions[region as Region]}
                    onChange={(e) => {
                      handlePreferencesChange(e);
                    }}
                  ></input>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}
