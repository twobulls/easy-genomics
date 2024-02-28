/**
 * The following Unique Reference model represents the data stored in the
 * unique-reference-table, using a single-table design pattern, to enforce
 * object-type key uniqueness.
 *
 * The Value serves as the DynamoDB HashKey, and the Type serves as the DynamoDB
 * SortKey - and cannot be modified after creation.
 *
 * {
 *   Value: <string>,
 *   Type: <string>,
 * }
 */

export interface UniqueReference {
  Value: string; // DynamoDB Partition Key (String)
  Type: string; // DynamoDB Sort Key (String)
}
