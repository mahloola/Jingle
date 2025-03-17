import { useState, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import duration from "dayjs/plugin/duration";

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
  const start = dayjs();
  const diff = dayjs.duration(dayjs(end).diff(start));
  const hours = String(diff.hours()).padStart(2, "0");
  const minutes = String(diff.minutes()).padStart(2, "0");
  const seconds = String(diff.seconds()).padStart(2, "0");
  return [hours, minutes, seconds].join(":");
}
