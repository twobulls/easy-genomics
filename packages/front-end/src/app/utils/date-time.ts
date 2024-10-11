import { format, parseISO, isValid } from 'date-fns';

function parseAndValidateDate(input: string | null | undefined) {
  if (!input) {
    console.error('Invalid or missing date string provided:', input);
    return null;
  }
  const date = parseISO(input); // ISO 8601 format '2007-12-03T10:15:30Z'
  if (!isValid(date)) {
    console.error('Invalid date string provided:', input);
    return null;
  }
  return date;
}

/**
 * Return the date in the format yyyy-MM-dd, e.g. '2021-01-01'
 * @param input
 */
export function getDate(input: string | null | undefined): string | null {
  if (!input) {
    return null;
  }

  const date = parseAndValidateDate(input);
  if (!date) return null;

  return format(date, 'yyyy-MM-dd');
}

/**
 * Return the time in the format hh:mm:ss a GMT+/-offset, e.g. '09:38:13 AM GMT+10'
 * @param input
 */
export function getTime(input: string | null | undefined): string | null {
  if (!input) {
    return null;
  }

  const date = parseAndValidateDate(input);
  if (!date) return null;

  const offsetInHours = -date.getTimezoneOffset() / 60;
  const offset = offsetInHours >= 0 ? `+${Math.abs(offsetInHours)}` : `-${Math.abs(offsetInHours)}`;
  const formattedDate = format(date, 'hh:mm:ss a');
  return `${formattedDate} GMT${offset}`;
}
