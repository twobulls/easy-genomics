import { format } from 'date-fns';

/**
 * Return the date in the format yyyy-MM-dd, e.g. '2021-01-01'
 * @param input
 */
export function getDate(input: Date) {
  return format(new Date(input), 'yyyy-MM-dd');
}

/**
 * Return the time in the format hh:mm:ss a GMT+/-offset, e.g. '09:38:13 AM GMT+10'
 * @param input
 */
export function getTime(input: Date) {
  const date = new Date(input);
  const offsetInHours = -date.getTimezoneOffset() / 60;
  const offset = offsetInHours > 0 ? `+${offsetInHours}` : offsetInHours;
  const formattedDate = format(date, 'hh:mm:ss a');

  return `${formattedDate} GMT${offset}`;
}
