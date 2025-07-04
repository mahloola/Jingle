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
  const seenAnnouncementId = loadSeenAnnouncementIdFromBrowser();
  const [open, setOpen] = useState(
    // TODO: change this so that it shows when we make a new announcement
    seenAnnouncementId === null
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
            <div key={post.id} style={{ width: '100%' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ fontSize: '2rem' }}>{post.title}</div>
                <h6 className='news-date' style={{ marginRight: '10px' }}>
                  {post.date}
                </h6>
              </div>
              <div className='news-content'>
                {<div dangerouslySetInnerHTML={{ __html: post.content }} />}
              </div>
              {parseInt(post.id) !== NEWS_POSTS.length - 1 && <hr />}
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}
