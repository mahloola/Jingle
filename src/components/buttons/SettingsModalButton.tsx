import React, { useState } from 'react';
import { FaQuestionCircle } from 'react-icons/fa';
import { ASSETS } from '../../constants/assets';
import '../../style/modal.css';
import { Settings } from '../../types/jingle';
import Modal from '../Modal';
import IconButton from './IconButton';

interface SettingsModalButtonProps {
  onClick: () => void;
  open: boolean;
  onClose: () => void;
  currentSettings: any;
  onApplySettings: (settings: any) => void;
}

export default function SettingsModalButton({
  onClick,
  open,
  onClose,
  currentSettings,
  onApplySettings,
}: SettingsModalButtonProps) {
  const [settings, setSettings] = useState(currentSettings);
  const disabled = currentSettings === settings;

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    console.log(checked, name);
    setSettings((prev: Settings) => ({
      ...prev,
      [name]: checked,
    }));
    console.log('settings: ', settings);
  };

  return (
    <>
      <IconButton
        onClick={onClick}
        img={ASSETS['settings']}
      />
      <Modal
        open={open}
        onClose={onClose}
        onApplySettings={() => onApplySettings(settings)}
        saveDisabled={disabled}
      >
        <h2>Settings</h2>
        <table className={'settings-table'}>
          <tr className={'settings-row'}>
            <td style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              Hard Mode{' '}
              <FaQuestionCircle
                style={{ color: '#928270', fontSize: '0.8em' }}
              />
            </td>
            <td style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type='checkbox'
                name='hardMode'
                defaultChecked={settings.hardMode}
                onChange={(e) => {
                  handleSettingsChange(e);
                }}
              ></input>
            </td>
          </tr>
          <tr className={'settings-row'}>
            <td style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              2004 Audio{' '}
              <FaQuestionCircle
                style={{ color: '#928270', fontSize: '0.8em' }}
              />
            </td>
            <td>
              <input
                type='checkbox'
                name='oldAudio'
                defaultChecked={settings.oldAudio}
                onChange={(e) => {
                  handleSettingsChange(e);
                }}
              ></input>
            </td>
          </tr>
        </table>
      </Modal>
    </>
  );
}
