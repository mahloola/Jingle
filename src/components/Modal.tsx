import React from 'react';
import '../style/modal.css';

interface ModalProps {
  open: boolean;
  onClose: (open: boolean) => void;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, children }: ModalProps) {
  return (
    <div
      className='modal-container'
      style={{
        zIndex: 9999,
        opacity: open ? '1' : '0',
        transition: 'opacity 0.2s ease',
        pointerEvents: open ? 'auto' : 'none',
      }}
    >
      {children}
    </div>
  );
}
