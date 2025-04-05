import React from 'react';
import { ASSETS } from '../../constants/assets';
import '../../style/confirmButton.css';
//temp styling
const ConfirmButton = ({
  setConfirmedGuess,
}: {
  setConfirmedGuess: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const handleConfirmClick = () => {
    console.log('Confirm button clicked!');
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
