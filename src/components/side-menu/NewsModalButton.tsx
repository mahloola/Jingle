import { useState } from 'react';
import { ASSETS } from '../../constants/assets';
import { NEWS_POSTS } from '../../constants/news';
import '../../style/modal.css';
import {
  loadSeenAnnouncementIdFromBrowser,
  setSeenAnnouncementIdToBrowser,
} from '../../utils/browserUtil';
import Modal from '../Modal';
import IconButton from './IconButton';

export default function NewsModalButton() {
  const seenAnnouncementId = loadSeenAnnouncementIdFromBrowser() || '0';
  const latestAnnouncementId = NEWS_POSTS.length;
  const [open, setOpen] = useState(
    // TODO: change this so that it shows when we make a new announcement
    parseInt(seenAnnouncementId) < latestAnnouncementId,
  );
  const closeModal = () => {
    setOpen(false);
    setSeenAnnouncementIdToBrowser(latestAnnouncementId.toString());
  };

  return (
    <>
      <IconButton
        onClick={() => setOpen(true)}
        img={ASSETS['newsIcon']}
        unseenAnnouncement={seenAnnouncementId === null}
      />
      <Modal
        open={open}
        onClose={closeModal}
      >
        <img
          className='modal-bg-image'
          src='https://storage.googleapis.com/jingle-media/newspaper.png'
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            maxHeight: '50vh',
            overflowY: 'auto',
            scrollbarWidth: 'thin',
          }}
        >
          {NEWS_POSTS.map((post) => (
            <section
              key={post.id}
              style={{ width: '100%' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <h2 style={{ fontSize: '2rem' }}>{post.title}</h2>
                <h6
                  className='news-date'
                  style={{ marginRight: '10px' }}
                >
                  {post.date}
                </h6>
              </div>
              <section className='news-content'>
                {<p dangerouslySetInnerHTML={{ __html: post.content }} />}
              </section>
              {parseInt(post.id) !== NEWS_POSTS.length - 1 && <hr />}
            </section>
          ))}
        </div>
      </Modal>
    </>
  );
}
