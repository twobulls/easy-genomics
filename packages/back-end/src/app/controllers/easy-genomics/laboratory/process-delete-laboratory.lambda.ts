import { LaboratoryUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-user';
import {
  SnsProcessingEvent,
  SnsProcessingOperation,
} from '@easy-genomics/shared-lib/src/app/types/easy-genomics/sns-processing-event';
import { User } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
import { buildErrorResponse, buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, Handler, SQSRecord } from 'aws-lambda';
import { SQSEvent } from 'aws-lambda/trigger/sqs';
import { PlatformUserService } from '@BE/services/easy-genomics/platform-user-service';
import { UserService } from '@BE/services/easy-genomics/user-service';

const platformUserService = new PlatformUserService();
const userService = new UserService();

export const handler: Handler = async (event: SQSEvent): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    const sqsRecords: SQSRecord[] = event.Records;
    for (const sqsRecord of sqsRecords) {
      const body = JSON.parse(sqsRecord.body);
      const snsEvent: SnsProcessingEvent = <SnsProcessingEvent>JSON.parse(body.Message);

      switch (snsEvent.Type) {
        case 'LaboratoryUser':
          const laboratoryUser: LaboratoryUser = <LaboratoryUser>JSON.parse(JSON.stringify(snsEvent.Record));
          await processDeleteLaboratoryUserEvent(snsEvent.Operation, laboratoryUser);
          break;
        case 'Laboratory':
          // Organization record is deleted by the event publisher 'delete-organization' API for performance
          break;
        default:
          console.error(`Unsupported SNS Processing Event Type: ${snsEvent.Type}`);
      }
    }

    return buildResponse(200, JSON.stringify({ Status: 'Success' }));
  } catch (err: any) {
    console.error(err);
    return buildErrorResponse(err);
  }
};

async function processDeleteLaboratoryUserEvent(operation: SnsProcessingOperation, laboratoryUser: LaboratoryUser) {
  if (operation === 'DELETE') {
    console.log('Processing LaboratoryUser Deletion: ', laboratoryUser);
    const existingUser: User = await userService.get(laboratoryUser.UserId);
    await platformUserService.removeExistingUserFromLaboratory(
      {
        ...existingUser,
        ModifiedAt: new Date().toISOString(),
        ModifiedBy: 'SNS/SQS Processing',
      },
      laboratoryUser,
    );
  } else {
    console.error(`Unsupported SNS Processing Event Operation: ${operation}`);
  }
}
