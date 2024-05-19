export const calculateTimeDifference = (startTime, endTime) => {
  const differenceInSeconds = Math.floor((endTime - startTime) / 1000);
  const hours = Math.floor(differenceInSeconds / 3600);
  const minutes = Math.floor((differenceInSeconds % 3600) / 60);
  const seconds = differenceInSeconds % 60;

  const formattedTime = `${hours > 0 ? hours + ':' : ''}${minutes}:${
    seconds < 10 ? '0' : ''
  }${seconds}`;
  return formattedTime;
};
