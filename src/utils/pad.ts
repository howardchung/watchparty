const pad = (number: number, length: number) => {
  let s = String(number);
  while (s.length < (length || 2)) {
    s = '0' + s;
  }
  return s;
};

export default pad;
