import React from 'react';

export const Button = (props: {
  label: string;
  disabled?: boolean;
  classes?: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) => {
  const baseClasses = 'osrs-btn';
  const combinedClasses = props.classes ? `${baseClasses} ${props.classes}` : baseClasses;

  return (
    <button
      className={combinedClasses}
      onClick={props.onClick}
      disabled={props.disabled}
      style={{ pointerEvents: !props.onClick ? 'none' : 'auto' }}
    >
      {props.label}
    </button>
  );
};
