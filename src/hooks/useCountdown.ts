import { useState, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import duration from "dayjs/plugin/duration";
import { calculateTimeDifference } from "../utils/date-utils";

dayjs.extend(duration);

export default function useCountdown(end: Dayjs) {
  const [countdown, setCountdown] = useState(formatCountdown(end));
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(formatCountdown(end));
    }, 1000);
    return () => clearInterval(interval);
  }, [end]);
  return countdown;
}

function formatCountdown(end: Dayjs): string {
  return calculateTimeDifference(Date.now(), end.valueOf());
}
