export function getStartOfDay() {
  const now = Date.now();
  return now - (now % 86400000);
}

export function getStartOfHour() {
  const now = Date.now();
  return now - (now % 3600000);
}

export function getStartOfMinute() {
  const now = Date.now();
  return now - (now % 60000);
}
