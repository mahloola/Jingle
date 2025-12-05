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
  const [open, setOpen] = useState(parseInt(seenAnnouncementId) < latestAnnouncementId);
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
              </div>
              <section className='news-content'>
                {<p dangerouslySetInnerHTML={{ __html: post.content }} />}
              </section>
              <h6
                className='news-date'
                style={{ marginLeft: 'auto', width: '100px', color: 'var(--primary-yellow-dark)' }}
              >
                {post.date}
              </h6>
              {parseInt(post.id) !== 1 && <hr />}
            </section>
          ))}
        </div>
      </Modal>
    </>
  );
}
