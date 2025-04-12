import { useState } from 'react';
import { ASSETS } from '../../constants/assets';
import '../../style/modal.css';
import Modal from '../Modal';
import IconButton from './IconButton';
import {
  loadSeenAnnouncementIdFromBrowser,
  setSeenAnnouncementIdToBrowser,
} from '../../utils/browserUtil';

export default function NewsModalButton() {
  const seenAnnouncementId = loadSeenAnnouncementIdFromBrowser();
  const [open, setOpen] = useState(
    // TODO: change this so that it shows when we make a new announcement
    seenAnnouncementId === null,
  );
  const closeModal = () => {
    setOpen(false);
    setSeenAnnouncementIdToBrowser('1');
  };

  return (
    <>
      <IconButton
        onClick={() => setOpen(true)}
        img={ASSETS['newsIcon']}
        unseenAnnouncement={seenAnnouncementId === null}
      />
      <Modal open={open} onClose={closeModal}>
        <img
          className='modal-bg-image'
          src='https://storage.googleapis.com/jingle-media/newspaper.png'
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <h2>News</h2>
          <h6 className='news-date'>Apr 7, 2025</h6>
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
        <p style={{ margin: '0' }}>
          Hi guys, this is <span className='link'>mahloola</span>.
          <br />
          Thank you for playing Jingle! We notice and appreciate you all. Big
          thanks to <span className='link'>FunOrange</span>,{' '}
          <span className='link'>Kunito Moe</span>, and the{' '}
          <span className='link'>wiki map editors</span> for helping me with
          these updates!
          <br />
          Enjoy these new features, and feel free to join the{' '}
          <a href='https://discord.gg/7sB8fyUS9W' className='link'>
            discord! 😊
          </a>
        </p>
      </Modal>
    </>
  );
}
