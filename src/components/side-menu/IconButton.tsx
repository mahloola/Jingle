import React from 'react';
import '../../style/iconButton.css';

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  img: string;
  unseenAnnouncement?: boolean;
}
export default function IconButton({
  img,
  unseenAnnouncement,
  ...props
}: IconButtonProps) {
  return (
    <button className='osrs-btn icon-button' {...props}>
      <img src={img} alt='OSRS Button' />
      {unseenAnnouncement && <span className='notification-badge'>1</span>}
    </button>
  );
}
