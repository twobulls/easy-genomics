/**
 * Validates a single field value against a given schema and adds any resulting validation errors to the provided errors array.
 * This function is used to validate individual fields in the form, allowing for custom validation logic per field.
 *
 * @param errors - The array to which any discovered validation errors will be added.
 * @param schema - The Zod schema against which the field value will be validated.
 * @param fieldName - The name of the field being validated. Used to associate errors with specific form fields.
 * @param fieldValue - The value of the field being validated. Can be undefined, in which case the schema determines validity.
 */
export function caseInsensitiveSortFn(a: any, b: any, direction: 'asc' | 'desc') {
  if (a.toLowerCase() === b.toLowerCase()) {
    return 0;
  }
  if (direction === 'asc') {
    return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
  } else {
    return a.toLowerCase() > b.toLowerCase() ? -1 : 1;
  }
}
