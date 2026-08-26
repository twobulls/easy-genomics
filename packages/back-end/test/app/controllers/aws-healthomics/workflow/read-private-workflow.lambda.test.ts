import { ResourceNotFoundException } from '@aws-sdk/client-omics';
import { APIGatewayProxyWithCognitoAuthorizerEvent, Context } from 'aws-lambda';
import { handler } from '../../../../../src/app/controllers/aws-healthomics/workflow/read-private-workflow.lambda';

jest.mock('../../../../../src/app/services/easy-genomics/laboratory-service');
jest.mock('../../../../../src/app/services/omics-service');
jest.mock('../../../../../src/app/utils/auth-utils');

import { LaboratoryService } from '../../../../../src/app/services/easy-genomics/laboratory-service';
import { OmicsService } from '../../../../../src/app/services/omics-service';
import {
  validateLaboratoryManagerAccess,
  validateLaboratoryTechnicianAccess,
  validateOrganizationAdminAccess,
} from '../../../../../src/app/utils/auth-utils';

describe('read-private-workflow.lambda', () => {
  const LAB_ID = '00000000-0000-0000-0000-000000000002';
  const ORG_ID = '00000000-0000-0000-0000-000000000001';
  const WF_ID = '1226079';

  let mockLabService: jest.MockedClass<typeof LaboratoryService>;
  let mockOmicsService: jest.MockedClass<typeof OmicsService>;
  let mockValidateOrgAdmin: jest.MockedFunction<typeof validateOrganizationAdminAccess>;
  let mockValidateLabManager: jest.MockedFunction<typeof validateLaboratoryManagerAccess>;
  let mockValidateLabTechnician: jest.MockedFunction<typeof validateLaboratoryTechnicianAccess>;

  const createEvent = (
    query: Record<string, string | undefined>,
    overrides: Partial<APIGatewayProxyWithCognitoAuthorizerEvent> = {},
  ): APIGatewayProxyWithCognitoAuthorizerEvent =>
    ({
      body: null,
      isBase64Encoded: false,
      httpMethod: 'GET',
      path: '/aws-healthomics/workflow/read-private-workflow',
      headers: {},
      requestContext: {
        authorizer: {
          claims: {
            email: 'user@example.com',
          },
        },
      },
      resource: '',
      queryStringParameters: query,
      multiValueQueryStringParameters: null,
      pathParameters: { id: WF_ID },
      stageVariables: null,
      multiValueHeaders: {},
      ...overrides,
    }) as any;

  const createContext = (): Context =>
    ({
      functionName: 'read-private-workflow',
      functionVersion: '$LATEST',
      invokedFunctionArn: 'arn:aws:lambda:region:acct:function:read-private-workflow',
      memoryLimitInMB: '128',
      awsRequestId: 'req-id',
      logGroupName: '/aws/lambda/read-private-workflow',
      logStreamName: '2026/03/24/[$LATEST]test',
      identity: undefined,
      clientContext: undefined,
      callbackWaitsForEmptyEventLoop: true,
      getRemainingTimeInMillis: () => 30000,
      done: jest.fn(),
      fail: jest.fn(),
      succeed: jest.fn(),
    }) as any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockLabService = LaboratoryService as jest.MockedClass<typeof LaboratoryService>;
    mockOmicsService = OmicsService as jest.MockedClass<typeof OmicsService>;
    mockValidateOrgAdmin = validateOrganizationAdminAccess as any;
    mockValidateLabManager = validateLaboratoryManagerAccess as any;
    mockValidateLabTechnician = validateLaboratoryTechnicianAccess as any;

    mockValidateOrgAdmin.mockReturnValue(true);
    mockValidateLabManager.mockReturnValue(false);
    mockValidateLabTechnician.mockReturnValue(false);

    mockLabService.prototype.queryByLaboratoryId = jest.fn();
    mockOmicsService.prototype.getWorkflow = jest.fn();
    mockOmicsService.prototype.listSharedWorkflows = jest.fn();
  });

  it('returns the workflow directly when it is owned by this account', async () => {
    mockLabService.prototype.queryByLaboratoryId.mockResolvedValue({
      OrganizationId: ORG_ID,
      LaboratoryId: LAB_ID,
      AwsHealthOmicsEnabled: true,
    } as any);

    (mockOmicsService.prototype.getWorkflow as jest.Mock).mockResolvedValue({ id: WF_ID, name: 'own-workflow' });

    const result = await handler(createEvent({ laboratoryId: LAB_ID }), createContext(), () => {});

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({ id: WF_ID, name: 'own-workflow' });
    expect(mockOmicsService.prototype.getWorkflow).toHaveBeenCalledTimes(1);
    expect(mockOmicsService.prototype.listSharedWorkflows).not.toHaveBeenCalled();
  });

  it('resolves the owner account via ListShares and retries when the workflow is cross-account shared', async () => {
    mockLabService.prototype.queryByLaboratoryId.mockResolvedValue({
      OrganizationId: ORG_ID,
      LaboratoryId: LAB_ID,
      AwsHealthOmicsEnabled: true,
    } as any);

    (mockOmicsService.prototype.getWorkflow as jest.Mock)
      .mockRejectedValueOnce(new ResourceNotFoundException({ message: 'not found', $metadata: {} }))
      .mockResolvedValueOnce({ id: WF_ID, name: 'shared-workflow' });

    (mockOmicsService.prototype.listSharedWorkflows as jest.Mock).mockResolvedValue({
      shares: [{ resourceId: WF_ID, ownerId: '654654609030' }],
    });

    const result = await handler(createEvent({ laboratoryId: LAB_ID }), createContext(), () => {});

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({ id: WF_ID, name: 'shared-workflow' });
    expect(mockOmicsService.prototype.getWorkflow).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        id: WF_ID,
        workflowOwnerId: '654654609030',
      }),
    );
  });

  it('returns 404 when the workflow is not found and not shared into this account', async () => {
    mockLabService.prototype.queryByLaboratoryId.mockResolvedValue({
      OrganizationId: ORG_ID,
      LaboratoryId: LAB_ID,
      AwsHealthOmicsEnabled: true,
    } as any);

    (mockOmicsService.prototype.getWorkflow as jest.Mock).mockRejectedValue(
      new ResourceNotFoundException({ message: 'not found', $metadata: {} }),
    );
    (mockOmicsService.prototype.listSharedWorkflows as jest.Mock).mockResolvedValue({ shares: [] });

    const result = await handler(createEvent({ laboratoryId: LAB_ID }), createContext(), () => {});

    expect(result.statusCode).toBe(404);
  });
});
