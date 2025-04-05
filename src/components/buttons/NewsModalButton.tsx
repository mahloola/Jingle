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
        <img
          className='modal-bg-image'
          src='https://storage.googleapis.com/jingle-media/newspaper.png'
        ></img>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <h2>News</h2>
          <h6 className='news-date'>Apr 5, 2025</h6>
        </div>
        <p>
          - Varlamore added
          <br />- Stats (success%, max streak, etc.)
          <br />- Preference settings:
          <br />
          &emsp;- Region selection
          <br />
          &emsp;- 2004 audio
          <br />
          &emsp;- Hard mode
          <br />
          &emsp;- Confirmation button (no more misclicks)
        </p>
        <p>
          Hi guys, this is mahloola.
          <br />
          Thank you for playing Jingle! We notice and appreciate you all. Big
          thanks to{' '}
          <a
            href=''
            className='link'
          >
            FunOrange
          </a>
          ,{' '}
          <a
            href=''
            className='link'
          >
            Kunito Moe
          </a>
          , and the{' '}
          <a
            href=''
            className='link'
          >
            wiki map editors
          </a>{' '}
          for helping me with these updates!
          <br />
          Enjoy these new features, and feel free to join the{' '}
          <a
            href='https://discord.gg/7sB8fyUS9W'
            className='link'
          >
            discord! 😊
          </a>
        </p>
      </Modal>
    </>
  );
}
