import "../style/resultScreen.css";
import useCountdown from "../hooks/useCountdown";
import { Dayjs } from "dayjs";

interface CountdownProps {
  end: Dayjs;
}
const NextDailyCountdown = ({ end }: CountdownProps) => {
  const countdown = useCountdown(end);
  return (
    <span className="result-screen-time-row">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        viewBox="0 0 800 800"
        preserveAspectRatio="xMidYMid slice"
        className="clock-svg"
      >
        <defs>
          <pattern
            id="pppixelate-pattern"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
            patternTransform="translate(0 0) scale(40) rotate(0)"
            shapeRendering="crispEdges"
          >
            <rect width="1" height="1" x="7" y="1" fill="#edfd07"></rect>
            <rect width="1" height="1" x="8" y="1" fill="#edfd07"></rect>
            <rect width="1" height="1" x="9" y="1" fill="#edfd07"></rect>
            <rect width="1" height="1" x="10" y="1" fill="#edfd07"></rect>
            <rect width="1" height="1" x="11" y="1" fill="#edfd07"></rect>
            <rect width="1" height="1" x="5" y="2" fill="#edfd07"></rect>
            <rect width="1" height="1" x="6" y="2" fill="#edfd07"></rect>
            <rect width="1" height="1" x="7" y="2" fill="#edfd07"></rect>
            <rect width="1" height="1" x="11" y="2" fill="#edfd07"></rect>
            <rect width="1" height="1" x="12" y="2" fill="#edfd07"></rect>
            <rect width="1" height="1" x="13" y="2" fill="#edfd07"></rect>
            <rect width="1" height="1" x="3" y="3" fill="#edfd07"></rect>
            <rect width="1" height="1" x="4" y="3" fill="#edfd07"></rect>
            <rect width="1" height="1" x="5" y="3" fill="#edfd07"></rect>
            <rect width="1" height="1" x="9" y="3" fill="#edfd07"></rect>
            <rect width="1" height="1" x="13" y="3" fill="#edfd07"></rect>
            <rect width="1" height="1" x="14" y="3" fill="#edfd07"></rect>
            <rect width="1" height="1" x="15" y="3" fill="#edfd07"></rect>
            <rect width="1" height="1" x="3" y="4" fill="#edfd07"></rect>
            <rect width="1" height="1" x="9" y="4" fill="#edfd07"></rect>
            <rect width="1" height="1" x="15" y="4" fill="#edfd07"></rect>
            <rect width="1" height="1" x="2" y="5" fill="#edfd07"></rect>
            <rect width="1" height="1" x="3" y="5" fill="#edfd07"></rect>
            <rect width="1" height="1" x="9" y="5" fill="#edfd07"></rect>
            <rect width="1" height="1" x="15" y="5" fill="#edfd07"></rect>
            <rect width="1" height="1" x="16" y="5" fill="#edfd07"></rect>
            <rect width="1" height="1" x="2" y="6" fill="#edfd07"></rect>
            <rect width="1" height="1" x="9" y="6" fill="#edfd07"></rect>
            <rect width="1" height="1" x="16" y="6" fill="#edfd07"></rect>
            <rect width="1" height="1" x="1" y="7" fill="#edfd07"></rect>
            <rect width="1" height="1" x="2" y="7" fill="#edfd07"></rect>
            <rect width="1" height="1" x="9" y="7" fill="#edfd07"></rect>
            <rect width="1" height="1" x="16" y="7" fill="#edfd07"></rect>
            <rect width="1" height="1" x="17" y="7" fill="#edfd07"></rect>
            <rect width="1" height="1" x="1" y="8" fill="#edfd07"></rect>
            <rect width="1" height="1" x="9" y="8" fill="#edfd07"></rect>
            <rect width="1" height="1" x="17" y="8" fill="#edfd07"></rect>
            <rect width="1" height="1" x="1" y="9" fill="#edfd07"></rect>
            <rect width="1" height="1" x="9" y="9" fill="#edfd07"></rect>
            <rect width="1" height="1" x="17" y="9" fill="#edfd07"></rect>
            <rect width="1" height="1" x="1" y="10" fill="#edfd07"></rect>
            <rect width="1" height="1" x="10" y="10" fill="#edfd07"></rect>
            <rect width="1" height="1" x="17" y="10" fill="#edfd07"></rect>
            <rect width="1" height="1" x="1" y="11" fill="#edfd07"></rect>
            <rect width="1" height="1" x="2" y="11" fill="#edfd07"></rect>
            <rect width="1" height="1" x="11" y="11" fill="#edfd07"></rect>
            <rect width="1" height="1" x="16" y="11" fill="#edfd07"></rect>
            <rect width="1" height="1" x="17" y="11" fill="#edfd07"></rect>
            <rect width="1" height="1" x="2" y="12" fill="#edfd07"></rect>
            <rect width="1" height="1" x="12" y="12" fill="#edfd07"></rect>
            <rect width="1" height="1" x="16" y="12" fill="#edfd07"></rect>
            <rect width="1" height="1" x="2" y="13" fill="#edfd07"></rect>
            <rect width="1" height="1" x="3" y="13" fill="#edfd07"></rect>
            <rect width="1" height="1" x="15" y="13" fill="#edfd07"></rect>
            <rect width="1" height="1" x="16" y="13" fill="#edfd07"></rect>
            <rect width="1" height="1" x="3" y="14" fill="#edfd07"></rect>
            <rect width="1" height="1" x="15" y="14" fill="#edfd07"></rect>
            <rect width="1" height="1" x="3" y="15" fill="#edfd07"></rect>
            <rect width="1" height="1" x="4" y="15" fill="#edfd07"></rect>
            <rect width="1" height="1" x="5" y="15" fill="#edfd07"></rect>
            <rect width="1" height="1" x="13" y="15" fill="#edfd07"></rect>
            <rect width="1" height="1" x="14" y="15" fill="#edfd07"></rect>
            <rect width="1" height="1" x="15" y="15" fill="#edfd07"></rect>
            <rect width="1" height="1" x="5" y="16" fill="#edfd07"></rect>
            <rect width="1" height="1" x="6" y="16" fill="#edfd07"></rect>
            <rect width="1" height="1" x="7" y="16" fill="#edfd07"></rect>
            <rect width="1" height="1" x="11" y="16" fill="#edfd07"></rect>
            <rect width="1" height="1" x="12" y="16" fill="#edfd07"></rect>
            <rect width="1" height="1" x="13" y="16" fill="#edfd07"></rect>
            <rect width="1" height="1" x="7" y="17" fill="#edfd07"></rect>
            <rect width="1" height="1" x="8" y="17" fill="#edfd07"></rect>
            <rect width="1" height="1" x="9" y="17" fill="#edfd07"></rect>
            <rect width="1" height="1" x="10" y="17" fill="#edfd07"></rect>
            <rect width="1" height="1" x="11" y="17" fill="#edfd07"></rect>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pppixelate-pattern)"></rect>
      </svg>

      {countdown}
    </span>
  );
};

export default NextDailyCountdown;
