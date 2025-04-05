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

const modalStyles: Styles = {
  content: {
    display: 'flex',
    background: COLORS.brown,
    padding: '30px',
    outline: '2px solid #363029',
    position: 'fixed',
    width: '350px',
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
    borderRadius: '4px',
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
      className='modal-container'
      isOpen={open}
      onRequestClose={onClose}
      style={modalStyles}
      contentLabel='Example Modal'
    >
      {children}
      <div className={'modal-options'}>
        {onApplySettings && (
          <button
            className='modal-close-button'
            onClick={onApplySettings}
            disabled={saveDisabled}
          >
            Save
          </button>
        )}
        <button
          className='modal-close-button'
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </ReactModal>
  );
}
