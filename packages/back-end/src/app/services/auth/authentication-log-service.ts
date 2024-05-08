import { PutItemCommandOutput } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { AuthenticationLogEvent } from '@easy-genomics/shared-lib/src/app/types/auth/authentication-log-event';
import { DynamoDBService } from '../dynamodb-service';

export class AuthenticationLogService extends DynamoDBService {
  readonly AUTHENTICATION_LOG_TABLE_NAME: string = `${process.env.NAME_PREFIX}-authentication-log-table`;

  public constructor() {
    super();
  }

  public add = async (authenticationLogEvent: AuthenticationLogEvent): Promise<void> => {
    const logRequestMessage = `Add Authentication Log Event Username=${authenticationLogEvent.Username}, DateTime=${authenticationLogEvent.DateTime}`;
    console.info(`${logRequestMessage}`);

    const response: PutItemCommandOutput = await this.putItem({
      TableName: this.AUTHENTICATION_LOG_TABLE_NAME,
      ConditionExpression: 'attribute_not_exists(#Username) AND attribute_not_exists(#DateTime)',
      ExpressionAttributeNames: {
        '#Username': 'Username',
        '#DateTime': 'DateTime',
      },
      Item: marshall(authenticationLogEvent),
    });

    if (response.$metadata.httpStatusCode === 200) {
      return;
    } else {
      throw new Error(`${logRequestMessage} unsuccessful: HTTP Status Code=${response.$metadata.httpStatusCode}`);
    }
  };

}
