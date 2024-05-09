/**
 * The following AuthenticationLogEvent model represents the data stored in the
 * authentication-log-table.
 */
export interface AuthenticationLogEvent {
  UserName: string; // DynamoDB Partition Key (String) -- Cognito Internal User Id
  DateTime: number; // DynamoDB Sort Key (String)
  Event: string;
}

