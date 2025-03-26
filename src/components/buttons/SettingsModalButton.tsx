import { ASSETS } from '../../constants/assets';
import '../../style/modal.css';
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
  return (
    <>
      <IconButton
        onClick={onClick}
        img={ASSETS['settings']}
      />
      <Modal
        open={open}
        onClose={onClose}
      >
        <h2>Settings</h2>
        <div className='modal-line'>
          <span>Hard Mode</span>
          <input
            type='checkbox'
            onChange={(e) => {
              console.log(e.target.checked);
            }}
          ></input>
        </div>
        <div className='modal-line small-text-80'>
          <span>The music pauses after the first 1 second</span>
        </div>
      </Modal>
    </>
  );
}
