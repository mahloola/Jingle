import { ASSETS } from '../../constants/assets';
import '../../style/modal.css';
import Modal from '../Modal';
import IconButton from './IconButton';

interface NewsButtonModalProps {
  onClick: () => void;
  open: boolean;
  onClose: () => void;
}

export default function NewsModalButton({
  onClick,
  open,
  onClose,
}: NewsButtonModalProps) {
  return (
    <>
      <IconButton
        onClick={onClick}
        img={ASSETS['news']}
      />
      <Modal
        open={open}
        onClose={onClose}
      >
        <p>Some updates 😃</p>
        <ul>
          <li>Varlamore added</li>
          <li>
            Preference settings: region selection, 2004 audio, hard mode, and a
            confirmation button (no more misclicks!)
          </li>
          <li>Stats (song success rates, your best streak, etc.)</li>
        </ul>

        <h6>Apr 4, 2025</h6>
      </Modal>
    </>
  );
}
