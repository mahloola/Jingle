import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);

export function getNextUtcMidnight() {
  return dayjs().utc().add(1, 'day').hour(0).minute(0).second(0);
}

export const calculateTimeDifference = (startMs: number, endMs: number) => {
  const d = dayjs.duration(dayjs(endMs).diff(dayjs(startMs)));
  return [d.hours() > 0 && d.hours(), d.minutes(), d.seconds()]
    .filter((value) => value !== false)
    .map((value) => value.toString().padStart(2, '0'))
    .join(':');
};

export function getCurrentDateInBritain() {
  return dayjs().tz('Europe/London').format('YYYY-MM-DD');
}
