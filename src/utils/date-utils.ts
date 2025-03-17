import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import duration from "dayjs/plugin/duration";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);

export function getNextUtc4AM() {
  const now = dayjs().utc();
  const next4AM =
    now.hour() < 4
      ? now.hour(4).minute(0).second(0)
      : now.add(1, "day").hour(4).minute(0).second(0);
  return next4AM;
}

export const calculateTimeDifference = (startMs: number, endMs: number) => {
  const d = dayjs.duration(dayjs(endMs).diff(dayjs(startMs)));
  return [d.hours() > 0 && d.hours(), d.minutes(), d.seconds()]
    .filter(Boolean)
    .map((value) => value.toString().padStart(2, "0"))
    .join(":");
};

export function getCurrentDateInBritain() {
  return dayjs().tz("Europe/London").format("YYYY-MM-DD");
}
