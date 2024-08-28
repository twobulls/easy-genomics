import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import { LaboratoryUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-user';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { LaboratoryService } from '@BE/services/easy-genomics/laboratory-service';
import { LaboratoryUserService } from '@BE/services/easy-genomics/laboratory-user-service';
import { SsmService } from '@BE/services/ssm-service';

const laboratoryService = new LaboratoryService();
const laboratoryUserService = new LaboratoryUserService();
const ssmService = new SsmService();

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    // Get Path Parameter
    const id: string = event.pathParameters?.id || '';
    if (id === '') throw new Error('Required id is missing');

    // Lookup by LaboratoryId to confirm existence before deletion
    const existingLaboratory: Laboratory = await laboratoryService.queryByLaboratoryId(id);

    // Check LaboratoryUsers are empty before deletion
    const existingLaboratoryUsers: LaboratoryUser[] = await laboratoryUserService.queryByLaboratoryId(
      existingLaboratory.LaboratoryId,
    );
    if (existingLaboratoryUsers.length > 0) {
      throw new Error(`Laboratory deletion error, ${existingLaboratoryUsers.length} Users exists.`);
    }

    const isDeleted: boolean = await laboratoryService.delete(existingLaboratory);

    if (!isDeleted) {
      throw new Error('Laboratory deletion failed');
    }

    await ssmService
      .deleteParameter({
        Name: `/easy-genomics/organization/${existingLaboratory.OrganizationId}/laboratory/${existingLaboratory.LaboratoryId}/nf-access-token`,
      })
      .catch(() => {});

    return buildResponse(200, JSON.stringify({ Status: 'Success' }), event);
  } catch (err: any) {
    console.error(err);
    return buildResponse(400, JSON.stringify({ Error: getErrorMessage(err) }), event);
  }
};

// Used for customising error messages by exception types
function getErrorMessage(err: any) {
  return err.message;
}
