import pad from './pad';

const createDurationString = (duration: number) => {
  if (duration > 3600) {
    const hours = duration / 60 / 60;
    const hoursRest = hours % 1;
    const minutes = hoursRest * 60;
    const minutesRest = minutes % 1;
    const seconds = minutesRest * 60;
    return `${pad(Math.floor(hours - hoursRest), 2)}:${pad(
      Math.floor(minutes - minutesRest),
      2
    )}:${pad(Math.floor(seconds), 2)}`;
  }

  if (duration > 60) {
    const minutes = duration / 60;
    const rest = minutes % 1;
    const seconds = Math.floor(rest * 60);
    return `${pad(minutes - rest, 2)}:${pad(seconds, 2)}`;
  }

  return `00:${pad(duration, 2)}`;
};

export default createDurationString;
