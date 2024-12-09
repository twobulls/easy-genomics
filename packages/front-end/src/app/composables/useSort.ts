import { parse, isValid } from 'date-fns';

export default function useSort() {
  /**
   * Compares string values for sorting in a linguistically intuitive way
   *
   * @param {string} inputA
   * @param {string} inputB
   * @param {'asc' | 'desc'} direction
   * @return {number} comparison result
   */
  function stringSortCompare(inputA: string, inputB: string, direction: 'asc' | 'desc' = 'asc') {
    let a = inputA.toLowerCase();
    let b = inputB.toLowerCase();

    // if identical ignoring case, sort by case for consistency of results
    if (a === b) {
      a = inputA;
      b = inputB;
    }

    // numeric makes it treat numbers as wholes rather than individual digit characters
    let result = a.localeCompare(b, undefined, { numeric: true });

    if (direction === 'desc') {
      result *= -1;
    }

    return result;
  }

  /**
   * Compares number values for sorting
   *
   * @param {number} inputA
   * @param {number} inputB
   * @param {'asc' | 'desc'} direction
   * @return {number} comparison result
   */
  function numberSortCompare(inputA: number, inputB: number, direction: 'asc' | 'desc' = 'asc') {
    let result = inputA - inputB;

    if (direction === 'desc') {
      result *= -1;
    }

    return result;
  }

  /**
   * Compares date values for sorting
   * @param inputA - First date string in ISO 8601 format
   * @param inputB - Second date string in ISO 8601 format
   * @param direction
   */
  function dateSortCompare(inputA: string, inputB: string, direction: 'asc' | 'desc' = 'asc'): number {
    const dateA = parse(inputA, "yyyy-MM-dd'T'HH:mm:ss.SSSX", new Date());
    const dateB = parse(inputB, "yyyy-MM-dd'T'HH:mm:ss.SSSX", new Date());

    if (!isValid(dateA) || !isValid(dateB)) {
      throw new Error('Invalid date format');
    }

    const result = dateA.getTime() - dateB.getTime();

    return direction === 'asc' ? result : -result;
  }

  return {
    stringSortCompare,
    numberSortCompare,
    dateSortCompare,
  };
}
