import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);

export function getNextUtcMidnight() {
  const now = dayjs().utc();
  const nextMidnight =
    now.hour() < 0
      ? now.hour(0).minute(0).second(0)
      : now.add(1, 'day').hour(0).minute(0).second(0);
  return nextMidnight;
}

export const calculateTimeDifference = (startMs: number, endMs: number) => {
  const d = dayjs.duration(dayjs(endMs).diff(dayjs(startMs)));
  return [d.hours() > 0 && d.hours(), d.minutes(), d.seconds()]
    .filter(Boolean)
    .map((value) => value.toString().padStart(2, '0'))
    .join(':');
};

export function getCurrentDateInBritain() {
  return dayjs().tz('Europe/London').format('YYYY-MM-DD');
}
