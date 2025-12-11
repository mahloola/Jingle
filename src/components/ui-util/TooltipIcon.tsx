import { FaQuestionCircle } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';

interface TooltipIconProps {
  id: string;
  content: string;
}

export const TooltipIcon = ({ id, content }: TooltipIconProps) => (
  <>
    <FaQuestionCircle
      data-tooltip-id={id}
      data-tooltip-content={content}
    />
    <Tooltip id={id} />
  </>
);
