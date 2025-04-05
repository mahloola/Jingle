import React from 'react';
import { COLORS } from '../../constants/theme';

//temp styling
const ConfirmButton = ({
  setConfirmedGuess,
}: {
  setConfirmedGuess: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <div
      style={{
        height: '5rem',
        width: '15rem',
        display: 'inline-block',
        position: 'fixed',
        bottom: '220px',
        zIndex: 999,
        backgroundColor: COLORS.brown,
        border: '0.1rem solid rgba(57, 48, 35, 1)',
        borderRadius: '0.2rem',
      }}
    >
      <button
        onClick={() => setConfirmedGuess(true)}
        style={{
          color: COLORS.yellow,
          width: '100%',
          height: '100%',
          padding: '0.5rem 1rem 0.1rem 1rem',
        }}
      >
        <div>Confirm Guess</div>
      </button>
    </div>
  );
};

export default ConfirmButton;
