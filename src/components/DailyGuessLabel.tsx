import { ASSETS } from '../constants/assets';
import { COLORS } from '../constants/theme';

interface DailyGuessLabelProps {
  number?: number;
  opacity?: number;
}
const DailyGuessLabel = ({ number, opacity }: DailyGuessLabelProps) => {
  return (
    <div style={{ position: 'relative', opacity: opacity }}>
      <img
        src={ASSETS['label']}
        alt='OSRS Button'
      />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '18px',
          fontStyle: 'italic',
          fontFamily: 'Runescape UF',
          color: COLORS.yellow,
          pointerEvents: 'none',
        }}
      >
        {number || '-'}
      </div>
    </div>
  );
};

export default DailyGuessLabel;
