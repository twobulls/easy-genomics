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
   * Compares date values in yyyy-mm-dd format for sorting
   *
   * @param {string} inputA
   * @param {string} inputB
   * @param {'asc' | 'desc'} direction
   * @return {number} comparison result
   */
  function dateSortCompare(inputA: string, inputB: string, direction: 'asc' | 'desc' = 'asc') {
    const dateA = new Date(inputA);
    const dateB = new Date(inputB);

    let result = dateA.getTime() - dateB.getTime();

    if (direction === 'desc') {
      result *= -1;
    }

    return result;
  }

  return {
    stringSortCompare,
    numberSortCompare,
    dateSortCompare,
  };
}
