import React from 'react';
import ReactModal, { Styles } from 'react-modal';
import '../style/modal.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const modalStyles: Styles = {
  content: {
    display: 'flex',
    background: '#53493e',
    padding: '20px',
    outline: '2px solid #363029',
    position: 'fixed',
    width: '324px',
    height: 'auto',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#edfd07',
    zIndex: 9999999,
    fontFamily: 'Runescape UF',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '4px',
    transition: 'all 0.3s ease',
  },
};

ReactModal.setAppElement('#root');

export default function Modal({ open, onClose, children }: ModalProps) {
  return (
    <ReactModal
      className='modal-container'
      isOpen={open}
      onRequestClose={onClose}
      style={modalStyles}
      contentLabel='Example Modal'
    >
      {children}
      <button
        className='modal-close-button'
        onClick={onClose}
      >
        Close
      </button>
    </ReactModal>
  );
}
