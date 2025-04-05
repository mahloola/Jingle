import React from 'react';
import { ASSETS } from '../../constants/assets';
import '../../style/confirmButton.css';
//temp styling

interface ConfirmButtonProps {
  setConfirmedGuess: React.Dispatch<React.SetStateAction<boolean>>;
}

const ConfirmButton = ({ setConfirmedGuess }: ConfirmButtonProps) => {
  const handleConfirmClick = () => {
    setConfirmedGuess(true);
  };

  return (
    <div
      className='confirm-btn-container'
      onClick={handleConfirmClick}
    >
      <img
        src={ASSETS['confirm']}
        alt='OSRS Button'
      />
      <div className='confirm-btn'>Confirm Guess</div>
    </div>
  );
};

export default ConfirmButton;
