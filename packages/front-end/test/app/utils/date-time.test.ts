import { getDate, getDateOrTimeIfToday, getTime } from '../../../src/app/utils/date-time';

describe('getDate', () => {
  it('formats a valid ISO date as yyyy-MM-dd in local time', () => {
    const localNoon = new Date(2021, 0, 1, 12, 0, 0);
    expect(getDate(localNoon.toISOString())).toBe('2021-01-01');
  });

  it('returns null for missing input', () => {
    expect(getDate(null)).toBeNull();
    expect(getDate(undefined)).toBeNull();
    expect(getDate('')).toBeNull();
  });
});

describe('getTime', () => {
  it('formats a valid ISO date with local time and GMT offset', () => {
    expect(getTime('2021-01-01T09:38:13.000Z')).toMatch(/^\d{2}:\d{2}:\d{2} (AM|PM) GMT[+-]\d+(\.\d+)?$/);
  });

  it('returns null for missing input', () => {
    expect(getTime(null)).toBeNull();
    expect(getTime(undefined)).toBeNull();
    expect(getTime('')).toBeNull();
  });
});

describe('getDateOrTimeIfToday', () => {
  it('returns null for missing input', () => {
    expect(getDateOrTimeIfToday(null)).toBeNull();
    expect(getDateOrTimeIfToday(undefined)).toBeNull();
    expect(getDateOrTimeIfToday('')).toBeNull();
  });

  it('returns null for an invalid date string', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(getDateOrTimeIfToday('not-a-date')).toBeNull();
    errorSpy.mockRestore();
  });

  it('returns the time when the date is today (local calendar day)', () => {
    const todayLocal = new Date();
    todayLocal.setHours(12, 30, 45, 0);
    const iso = todayLocal.toISOString();

    expect(getDateOrTimeIfToday(iso)).toBe(getTime(iso));
  });

  it('returns the date when the date is not today', () => {
    const iso = '2020-06-15T12:00:00.000Z';

    expect(getDateOrTimeIfToday(iso)).toBe(getDate(iso));
    expect(getDateOrTimeIfToday(iso)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
