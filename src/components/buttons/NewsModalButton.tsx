import { ASSETS } from '../../constants/assets';
import '../../style/modal.css';
import Modal from '../Modal';
import IconButton from './IconButton';

interface NewsButtonModalProps {
  onClick: () => void;
  open: boolean;
  onClose: () => void;
  seenAnnouncementId: string | null;
}

export default function NewsModalButton({
  onClick,
  open,
  onClose,
  seenAnnouncementId,
}: NewsButtonModalProps) {
  return (
    <>
      <IconButton
        onClick={onClick}
        img={ASSETS['news']}
        unseenAnnouncement={seenAnnouncementId === null}
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
          <br />- QOL:
          <br />
          &emsp;- Edge distance calculation (vs center) &emsp;- Result copying
          stats fixed for mobile
        </p>
        <p>
          Hi guys, this is <span className='link'>mahloola</span>.
          <br />
          Thank you for playing Jingle! We notice and appreciate you all. Big
          thanks to <span className='link'>FunOrange</span>,{' '}
          <span className='link'>Kunito Moe</span>, and the{' '}
          <span className='link'>wiki map editors</span> for helping me with
          these updates!
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
