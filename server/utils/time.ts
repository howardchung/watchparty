export function getStartOfDay() {
  const now = Number(new Date());
  return now - (now % 86400000);
}

export function getStartOfHour() {
  const now = Number(new Date());
  return now - (now % 3600000);
}

export function getStartOfMinute() {
  const now = Number(new Date());
  return now - (now % 60000);
}
