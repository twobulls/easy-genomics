/**
 * An insensitive case sort function for use by Nuxt UI tables
 */
export function caseInsensitiveSortFn(a: string, b: string, direction: 'asc' | 'desc'): number {
  if (a.toLowerCase() === b.toLowerCase()) {
    // If idenical ignoring case, sort by case for consistency of results
    if (direction === 'asc') {
      return a < b ? -1 : 1;
    } else {
      return a > b ? -1 : 1;
    }
    return 0;
  }
  if (direction === 'asc') {
    return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
  } else {
    return a.toLowerCase() > b.toLowerCase() ? -1 : 1;
  }
}
