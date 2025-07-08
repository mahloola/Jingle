import { FaChevronDown } from 'react-icons/fa6';
import { IoWarning } from 'react-icons/io5';
import { Tooltip } from 'react-tooltip';
import { COLORS } from '../../constants/theme';

interface ExpandableSectionProps {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  tooltip?: string;
  disabled?: boolean;
}

export const ExpandableSection = ({
  title,
  expanded,
  onToggle,
  tooltip,
  disabled = false,
}: ExpandableSectionProps) => (
  <tr>
    <td>
      {title}{' '}
      <FaChevronDown
        onClick={disabled ? undefined : onToggle}
        className={expanded ? 'rotated' : ''}
        style={{ pointerEvents: disabled ? 'none' : 'auto' }}
      />
      {disabled && tooltip && (
        <>
          <IoWarning
            style={{
              color: COLORS.yellow,
              minHeight: '20px',
              minWidth: '20px',
            }}
            data-tooltip-id={`${title}-tooltip`}
            data-tooltip-content={tooltip}
          />
          <Tooltip id={`${title}-tooltip`} />
        </>
      )}
    </td>
  </tr>
);
