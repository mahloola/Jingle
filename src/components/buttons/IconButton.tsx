import React from 'react';
import '../../style/modal.css';

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  img: string;
}
export default function IconButton({ img, ...props }: IconButtonProps) {
  console.log('Rendering IconButton: ', img);
  return (
    <button
      className={'icon-button'}
      style={{ backgroundImage: `url(${img})` }}
      {...props}
    />
  );
}
