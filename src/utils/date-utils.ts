import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export function getNextUtc4AM() {
  const now = dayjs().utc();
  const next4AM =
    now.hour() < 4
      ? now.hour(4).minute(0).second(0)
      : now.add(1, "day").hour(4).minute(0).second(0);
  return next4AM;
}

export const calculateTimeDifference = (startTime: number, endTime: number) => {
  const differenceInSeconds = Math.floor((endTime - startTime) / 1000);
  const hours = Math.floor(differenceInSeconds / 3600);
  const minutes = Math.floor((differenceInSeconds % 3600) / 60);
  const seconds = differenceInSeconds % 60;

  const formattedTime = `${hours > 0 ? hours + ":" : ""}${minutes}:${
    seconds < 10 ? "0" : ""
  }${seconds}`;
  return formattedTime;
};

export function getCurrentDateInBritain() {
  // Create a new Date object
  const now = new Date();

  // Format the date for the Europe/London timezone
  const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Europe/London",
  });

  // Format the date
  const formattedDate = dateFormatter.format(now);

  // Convert the formatted date to the desired YYYY-MM-DD format
  const [day, month, year] = formattedDate.split("/");

  return `${year}-${month}-${day}`;
}
