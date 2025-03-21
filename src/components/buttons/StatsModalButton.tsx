import { ASSETS } from '../../constants/assets';
import '../../style/modal.css';
import Modal from '../Modal';
import IconButton from './IconButton';

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
        <h2>Personal Statistics</h2>
        <div className='modal-line'>
          <span>Games Played</span>
          <span>100</span>
        </div>
        <div className='modal-line'>
          <span>Success Rate</span>
          <span>19.37%</span>
        </div>
        <br />
        <h2>Global Statistics</h2>
        <div className='modal-line'>
          <span>Total Guesses</span>
          <span>1,347,537</span>
        </div>
        <div className='modal-line'>
          <span>Success Rate</span>
          <span>4.37%</span>
        </div>
      </Modal>
    </>
  );
}
