import pad from './pad';

describe('functionality', () => {
  it('generates a padded number', () => {
    const resultA = pad(5, 2);
    expect(resultA).toBe('05');

    const resultB = pad(9, 5);
    expect(resultB).toBe('00009');

    const resultC = pad(155, 4);
    expect(resultC).toBe('0155');
  });
});
