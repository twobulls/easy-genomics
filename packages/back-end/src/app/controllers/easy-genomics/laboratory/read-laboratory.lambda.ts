import { GetParameterCommandOutput } from '@aws-sdk/client-ssm';
import { ReadLaboratory } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/laboratory';
import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { LaboratoryService } from '../../../services/easy-genomics/laboratory-service';
import { SsmService } from '../../../services/ssm-service';

const laboratoryService = new LaboratoryService();
const ssmService = new SsmService();

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    // Get Path Parameter
    const id: string = event.pathParameters?.id || '';
    if (id === '') throw new Error('Required id is missing');

    // Lookup by GSI Id for convenience
    const existing: Laboratory = await laboratoryService.queryByLaboratoryId(id);

    const hasNextFlowAccessToken: boolean = await ssmService
      .getParameter({
        Name: `/easy-genomics/organization/${existing.OrganizationId}/laboratory/${existing.LaboratoryId}/nf-access-token`,
      })
      .then((value: GetParameterCommandOutput) => !!value.Parameter)
      .catch((_) => {
        return false;
      });

    // Return Laboratory details with boolean indicator instead of actual NextFlowTowerAccessToken
    const response: ReadLaboratory = {
      ...existing,
      HasNextFlowTowerAccessToken: hasNextFlowAccessToken,
    };
    return buildResponse(200, JSON.stringify(response), event);
  } catch (err: any) {
    console.error(err);
    return buildResponse(200, JSON.stringify({ Error: getErrorMessage(err) }), event);
  }
};

// Used for customising error messages by exception types
function getErrorMessage(err: any) {
  return err.message;
}
