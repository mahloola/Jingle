export const Button = (props: {
  label: string;
  disabled?: boolean;
  onClick: () => any;
}) => {
  return (
    <button
      className='osrs-btn guess-btn'
      onClick={props.onClick}
      disabled={props.disabled}
      style={{ pointerEvents: !props.onClick ? 'none' : 'auto' }}
    >
      {props.label}
    </button>
  );
};
