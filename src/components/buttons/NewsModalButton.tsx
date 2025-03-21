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
        <h2>March 21, 2025</h2>
        <p>Hi, welcome to Jingle</p>
      </Modal>
    </>
  );
}
