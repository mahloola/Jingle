import React, { useState } from 'react';
import { FaChevronDown, FaQuestionCircle } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import { DEFAULT_LOBBY_SETTINGS } from '../../constants/defaults';
import {
  Region,
  REGIONS,
  TOTAL_TRACK_COUNT,
  UNDERGROUND_TRACKS,
  UNDERGROUND_TRACKS_STRICT,
} from '../../constants/regions';
import { LobbySettings } from '../../types/jingle';
import { countSelectedSongs } from '../../utils/countSelectedSongs';
import Modal from '../Modal';
import CustomRangeInput from '../ui-util/CustomRangeInput';

interface CreateLobbyModalProps {
  onCreateLobby: ({
    lobbySettings,
    lobbyName,
    lobbyPassword,
  }: {
    lobbySettings: LobbySettings;
    lobbyName: string;
    lobbyPassword: string | undefined;
  }) => void;
  onClose: () => void;
}

const CreateLobbyModal: React.FC<CreateLobbyModalProps> = ({ onCreateLobby, onClose }) => {
  const [lobbyName, setLobbyName] = useState<string>('');
  const [lobbyPassword, setLobbyPassword] = useState<string | undefined>('');
  const [lobbySettings, setLobbySettings] = useState<LobbySettings>(DEFAULT_LOBBY_SETTINGS);
  const [regionsOpen, setRegionsOpen] = useState(false);
  const toggleRegions = () => {
    setRegionsOpen((prev) => !prev);
  };
  const [dungeonsOpen, setDungeonsOpen] = useState(false);
  const toggleDungeons = () => {
    setDungeonsOpen((prev) => !prev);
  };

  const disabled =
    Object.values(lobbySettings.regions).every((enabled) => !enabled) ||
    (!lobbySettings.undergroundSelected && !lobbySettings.surfaceSelected) ||
    lobbyName == '';

  const handleHardModeTimeChange = (value: number) => {
    setLobbySettings((prev) => {
      return {
        ...prev,
        hardModeLength: value,
      };
    });
  };
  const handlePreferencesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked, value, type } = e.target;

    if (name.startsWith('regions.')) {
      const region = name.split('.')[1] as Region;
      setLobbySettings((prev: LobbySettings) => ({
        ...prev,
        regions: {
          ...prev.regions,
          [region]: checked,
        },
      }));
    } else {
      setLobbySettings((prev: LobbySettings) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;

    if (newPassword) {
      setLobbyPassword(e.target.value);
      setLobbySettings((prev: LobbySettings) => ({
        ...prev,
        hasPassword: true,
      }));
    } else {
      setLobbyPassword(undefined);
      setLobbySettings((prev: LobbySettings) => ({
        ...prev,
        hasPassword: false,
      }));
    }
  };

  return (
    <Modal
      open={true}
      saveDisabled={disabled}
      primaryButtonText='Create'
      onClose={onClose}
      onApplySettings={() => onCreateLobby({ lobbySettings, lobbyName, lobbyPassword })}
    >
      <h2>Create Lobby</h2>
      <label
        htmlFor='lobbyName'
        style={{ width: '100%' }}
      >
        Lobby Name
      </label>
      <input
        type='text'
        placeholder='Enter lobby name...'
        className='search-bar'
        value={lobbyName}
        name='lobbyName'
        maxLength={30}
        onChange={(e) => setLobbyName(e.target.value)}
        style={{ width: '100%', padding: '5px 10px', borderRadius: '10px', margin: '10px' }}
      />
      <label
        htmlFor='roundTimeSeconds'
        style={{ width: '100%' }}
      >
        Round Time (seconds){' '}
        <FaQuestionCircle
          data-tooltip-id='round-time-tooltip'
          data-tooltip-content='You get this many seconds to guess the song'
        />
        <Tooltip id='round-time-tooltip' />
      </label>
      <input
        type='number'
        placeholder='Seconds per round'
        className='search-bar'
        value={lobbySettings.roundTimeSeconds}
        name='roundTimeSeconds'
        onChange={(e) => handlePreferencesChange(e)}
        style={{ width: '100%', padding: '5px 10px', borderRadius: '10px', margin: '10px' }}
      />
      <label
        htmlFor='roundIntervalSeconds'
        style={{ width: '100%' }}
      >
        Round Interval (seconds){' '}
        <FaQuestionCircle
          data-tooltip-id='round-interval-tooltip'
          data-tooltip-content='This is the gap or "break" between each round'
        />
        <Tooltip id='round-interval-tooltip' />
      </label>
      <input
        type='number'
        placeholder='Seconds between rounds (interval)'
        className='search-bar'
        value={lobbySettings.roundIntervalSeconds}
        name='roundIntervalSeconds'
        onChange={(e) => handlePreferencesChange(e)}
        style={{ width: '100%', padding: '5px 10px', borderRadius: '10px', margin: '10px' }}
      />
      <label
        htmlFor='lobbyPassword'
        style={{ width: '100%' }}
      >
        Password (optional){' '}
      </label>
      <input
        type='password'
        placeholder='Leave empty for public lobbies...'
        className='search-bar'
        value={lobbyPassword}
        name='lobbyPassword'
        onChange={(e) => handlePasswordChange(e)}
        style={{ width: '100%', padding: '5px 10px', borderRadius: '10px', margin: '10px' }}
      />
      <table className={'settings-table'}>
        <tbody>
          <tr>
            <td>
              Hard Mode{' '}
              <FaQuestionCircle
                data-tooltip-id='hard-mode-tooltip'
                data-tooltip-content='You only get a x-second snippet (customizable)'
              />
              <Tooltip id='hard-mode-tooltip' />
            </td>
            <td>
              <input
                type='checkbox'
                name='hardMode'
                defaultChecked={false}
                onChange={(e) => {
                  handlePreferencesChange(e);
                }}
              ></input>
            </td>
          </tr>
          <tr
            className='hard-mode-row'
            style={{
              maxHeight: lobbySettings.hardMode ? '70px' : '0px',
            }}
          >
            <CustomRangeInput
              onValueChange={handleHardModeTimeChange}
              currentValue={lobbySettings.hardModeLength}
              visible={lobbySettings.hardMode}
            />
          </tr>
          <tr>
            <td>
              Underground{' '}
              <FaChevronDown
                onClick={toggleDungeons}
                className={dungeonsOpen ? 'rotated' : ''}
              />
            </td>
          </tr>
          <tr
            className={'regions-table'}
            style={{
              height: dungeonsOpen ? '35px' : '0px',
            }}
          >
            <td
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                minWidth: '140px',
              }}
            >
              <div>Dungeons ({UNDERGROUND_TRACKS.length})</div>
              <div className={'checkbox-container'}>
                <input
                  type='checkbox'
                  name={`undergroundSelected`}
                  checked={lobbySettings.undergroundSelected}
                  onChange={(e) => {
                    handlePreferencesChange(e);
                  }}
                ></input>
              </div>
            </td>
            <td
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '140px',
              }}
            >
              <div>Surface ({TOTAL_TRACK_COUNT - UNDERGROUND_TRACKS_STRICT.length})</div>
              <div className={'checkbox-container'}>
                <input
                  type='checkbox'
                  name={`surfaceSelected`}
                  checked={lobbySettings.surfaceSelected}
                  onChange={(e) => {
                    handlePreferencesChange(e);
                  }}
                ></input>
              </div>
            </td>
          </tr>
          <tr>
            <td>
              Regions{' '}
              <FaChevronDown
                onClick={toggleRegions}
                className={regionsOpen ? 'rotated' : ''}
              />
            </td>
          </tr>
        </tbody>
      </table>
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
              minWidth: '140px',
            }}
            key={region}
          >
            <div>
              {region} ({countSelectedSongs(lobbySettings, region as Region)})
            </div>
            <div className={'checkbox-container'}>
              <input
                type='checkbox'
                name={`regions.${region}`}
                checked={lobbySettings.regions[region as Region]}
                onChange={(e) => {
                  handlePreferencesChange(e);
                }}
              ></input>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default CreateLobbyModal;
