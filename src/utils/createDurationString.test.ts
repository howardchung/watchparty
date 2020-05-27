import createDurationString from './createDurationString';

describe('functionality', () => {
  it('transforms duration seconds into a duration string', () => {
    const result = createDurationString(540);
    expect(result).toBe('09:00');

    const resultTwo = createDurationString(520);
    expect(resultTwo).toBe('08:39');

    const resultThree = createDurationString(270);
    expect(resultThree).toBe('04:30');

    const resultFour = createDurationString(110);
    expect(resultFour).toBe('01:49');
  });

  it('transforms duration seconds into a duration string with hours', () => {
    const resultA = createDurationString(5400);
    expect(resultA).toBe('01:30:00');

    const resultB = createDurationString(5450);
    expect(resultB).toBe('01:30:49');
  });

  it('transforms duration seconds into a duration string with seconds', () => {
    const result = createDurationString(32);
    expect(result).toBe('00:32');
  });
});
