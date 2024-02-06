/**
 * String conversion utility to Pascal Case.
 * @param input
 */
export const toPascalCase = (input: string): string => {
  return `${input}`
    .toLowerCase()
    .replace(new RegExp(/[-_\/]+/, 'g'), ' ')
    .replace(new RegExp(/[^\w\s]/, 'g'), '')
    .replace(new RegExp(/\s+(.)(\w*)/, 'g'), (_1, _2, _3) => `${_2.toUpperCase() + _3}`)
    .replace(new RegExp(/\w/), (s) => s.toUpperCase());
};
