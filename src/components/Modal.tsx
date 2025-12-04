import React from 'react';
import ReactModal, { Styles } from 'react-modal';
import { COLORS } from '../constants/theme';
import '../style/modal.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  onApplySettings?: () => void;
  saveDisabled?: boolean;
}

const isMobile = window.innerWidth <= 480;
const modalStyles: Styles = {
  content: {
    display: 'flex',
    padding: '16px 32px 24px 32px',
    position: 'fixed',
    width: isMobile ? '340px' : '370px',
    height: 'auto',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    color: COLORS.yellow,
    zIndex: 9999999,
    fontFamily: 'Runescape UF',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'all 0.3s ease',
  },
};

ReactModal.setAppElement('#root');

export default function Modal({
  open,
  onClose,
  onApplySettings,
  saveDisabled,
  children,
}: ModalProps) {
  return (
    <ReactModal
      className='osrs-frame modal-container'
      isOpen={open}
      onRequestClose={onClose}
      style={modalStyles}
      contentLabel='Example Modal'
    >
      {children}
      <div className='modal-options'>
        <button
          className='osrs-btn modal-action-btn'
          onClick={onClose}
        >
          Close
        </button>
        {onApplySettings && (
          <button
            className='osrs-btn modal-action-btn'
            onClick={onApplySettings}
            disabled={saveDisabled}
          >
            Save
          </button>
        )}
      </div>
    </ReactModal>
  );
}
