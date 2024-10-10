import { OrganizationAccess } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
import { APIGatewayProxyEvent } from 'aws-lambda/trigger/api-gateway-proxy';
import { getLaboratoryAccessLaboratoryIds } from '../../../src/app/utils/auth-utils';

describe('get laboratory access ids from authorizer claims', () => {
  let mockEvent: APIGatewayProxyEvent = {
    body: '',
    headers: {},
    multiValueHeaders: {},
    httpMethod: 'GET',
    path: '/test/',
    isBase64Encoded: false,
    pathParameters: {},
    queryStringParameters: {},
    multiValueQueryStringParameters: {},
    stageVariables: {},
    resource: '',
    requestContext: {
      accountId: '',
      authorizer: {},
      protocol: '',
      httpMethod: '',
      identity: {
        accessKey: '',
        accountId: '',
        apiKey: '',
        apiKeyId: '',
        caller: '',
        clientCert: {
          serialNumber: '',
          clientCertPem: '',
          subjectDN: '',
          issuerDN: '',
          validity: {
            notAfter: '',
            notBefore: '',
          },
        },
        cognitoAuthenticationProvider: '',
        cognitoAuthenticationType: '',
        cognitoIdentityId: '',
        cognitoIdentityPoolId: '',
        principalOrgId: '',
        sourceIp: '',
        user: '',
        userAgent: '',
        userArn: '',
      },
      path: '',
      stage: '',
      apiId: '',
      requestId: '',
      requestTimeEpoch: 0,
      resourceId: '',
      resourcePath: '',
    },
  };

  it('No claims, should be empty', () => {
    const organizationId = 'b237c754-19d0-41bc-a2ca-b1736fc51413';
    mockEvent.requestContext.authorizer = {};
    expect(getLaboratoryAccessLaboratoryIds(mockEvent, organizationId)).toEqual([]);
  });

  it('Empty claims, should be empty', () => {
    const organizationId = 'b237c754-19d0-41bc-a2ca-b1736fc51413';
    mockEvent.requestContext.authorizer = {
      claims: {},
    };
    expect(getLaboratoryAccessLaboratoryIds(mockEvent, organizationId)).toEqual([]);
  });

  it('Empty Org Access, should be empty', () => {
    const organizationId = 'b237c754-19d0-41bc-a2ca-b1736fc51413';
    const organizationAccess: OrganizationAccess = {};
    mockEvent.requestContext.authorizer = {
      claims: {
        OrganizationAccess: JSON.stringify(organizationAccess),
      },
    };
    expect(getLaboratoryAccessLaboratoryIds(mockEvent, organizationId)).toEqual([]);
  });

  it('Org Access but not for request organizationId, should be empty', () => {
    const organizationId = 'b237c754-19d0-41bc-a2ca-b1736fc51413';
    const organizationAccess: OrganizationAccess = {
      'da47e581-834b-4eb4-9c8d-23e83767522d': {
        Status: 'Active',
      },
    };
    mockEvent.requestContext.authorizer = {
      claims: {
        OrganizationAccess: JSON.stringify(organizationAccess),
      },
    };
    expect(getLaboratoryAccessLaboratoryIds(mockEvent, organizationId)).toEqual([]);
  });

  it('Org Access but no laboratories, should be empty', () => {
    const organizationId = 'b237c754-19d0-41bc-a2ca-b1736fc51413';
    const organizationAccess: OrganizationAccess = {
      'b237c754-19d0-41bc-a2ca-b1736fc51413': {
        Status: 'Active',
        LaboratoryAccess: {},
      },
    };
    mockEvent.requestContext.authorizer = {
      claims: {
        OrganizationAccess: JSON.stringify(organizationAccess),
      },
    };
    expect(getLaboratoryAccessLaboratoryIds(mockEvent, organizationId)).toEqual([]);
  });

  it('Org Access with one laboratory, return one laboratoryId', () => {
    const organizationId = 'b237c754-19d0-41bc-a2ca-b1736fc51413';
    const organizationAccess: OrganizationAccess = {
      'b237c754-19d0-41bc-a2ca-b1736fc51413': {
        Status: 'Active',
        LaboratoryAccess: {
          '21072469-c909-43b9-9471-42b78b054ca2': {
            Status: 'Active',
          },
        },
      },
    };
    mockEvent.requestContext.authorizer = {
      claims: {
        OrganizationAccess: JSON.stringify(organizationAccess),
      },
    };
    expect(getLaboratoryAccessLaboratoryIds(mockEvent, organizationId)).toEqual([
      '21072469-c909-43b9-9471-42b78b054ca2',
    ]);
  });

  it('Ignore Org Access with Inactive Status', () => {
    const organizationId = 'b237c754-19d0-41bc-a2ca-b1736fc51413';
    const organizationAccess: OrganizationAccess = {
      'b237c754-19d0-41bc-a2ca-b1736fc51413': {
        Status: 'Inactive',
        LaboratoryAccess: {
          '21072469-c909-43b9-9471-42b78b054ca2': {
            Status: 'Active',
          },
        },
      },
    };
    mockEvent.requestContext.authorizer = {
      claims: {
        OrganizationAccess: JSON.stringify(organizationAccess),
      },
    };
    expect(getLaboratoryAccessLaboratoryIds(mockEvent, organizationId)).toEqual([]);
  });

  it('Ignore Org Access with Invited Status', () => {
    const organizationId = 'b237c754-19d0-41bc-a2ca-b1736fc51413';
    const organizationAccess: OrganizationAccess = {
      'b237c754-19d0-41bc-a2ca-b1736fc51413': {
        Status: 'Invited',
        LaboratoryAccess: {
          '21072469-c909-43b9-9471-42b78b054ca2': {
            Status: 'Active',
          },
        },
      },
    };
    mockEvent.requestContext.authorizer = {
      claims: {
        OrganizationAccess: JSON.stringify(organizationAccess),
      },
    };
    expect(getLaboratoryAccessLaboratoryIds(mockEvent, organizationId)).toEqual([]);
  });

  it('Org Access with multiple laboratories, return multiple laboratoryId', () => {
    const organizationId = 'b237c754-19d0-41bc-a2ca-b1736fc51413';
    const organizationAccess: OrganizationAccess = {
      'b237c754-19d0-41bc-a2ca-b1736fc51413': {
        Status: 'Active',
        LaboratoryAccess: {
          '21072469-c909-43b9-9471-42b78b054ca2': {
            Status: 'Active',
          },
          '41002720-9dc0-4c95-b06e-432d9c9cf757': {
            Status: 'Active',
          },
          '322eec6c-1b92-47c1-b79f-dea510ddf2dc': {
            Status: 'Active',
          },
        },
      },
    };
    mockEvent.requestContext.authorizer = {
      claims: {
        OrganizationAccess: JSON.stringify(organizationAccess),
      },
    };
    expect(getLaboratoryAccessLaboratoryIds(mockEvent, organizationId).sort()).toEqual(
      [
        '21072469-c909-43b9-9471-42b78b054ca2',
        '322eec6c-1b92-47c1-b79f-dea510ddf2dc',
        '41002720-9dc0-4c95-b06e-432d9c9cf757',
      ].sort(),
    );
  });

  it('Ignore laboratories from other organizations, should be empty', () => {
    const organizationId = 'b237c754-19d0-41bc-a2ca-b1736fc51413';
    const organizationAccess: OrganizationAccess = {
      'da47e581-834b-4eb4-9c8d-23e83767522d': {
        Status: 'Active',
        LaboratoryAccess: {
          '11072469-c909-43b9-9471-42b78b054ca2': {
            Status: 'Active',
          },
        },
      },
    };
    mockEvent.requestContext.authorizer = {
      claims: {
        OrganizationAccess: JSON.stringify(organizationAccess),
      },
    };
    expect(getLaboratoryAccessLaboratoryIds(mockEvent, organizationId)).toEqual([]);
  });

  it('Ignore LaboratoryAccess with Inactive Status', () => {
    const organizationId = 'b237c754-19d0-41bc-a2ca-b1736fc51413';
    const organizationAccess: OrganizationAccess = {
      'b237c754-19d0-41bc-a2ca-b1736fc51413': {
        Status: 'Active',
        LaboratoryAccess: {
          '21072469-c909-43b9-9471-42b78b054ca2': {
            Status: 'Active',
          },
          '41002720-9dc0-4c95-b06e-432d9c9cf757': {
            Status: 'Inactive',
          },
          '322eec6c-1b92-47c1-b79f-dea510ddf2dc': {
            Status: 'Active',
          },
        },
      },
    };
    mockEvent.requestContext.authorizer = {
      claims: {
        OrganizationAccess: JSON.stringify(organizationAccess),
      },
    };
    expect(getLaboratoryAccessLaboratoryIds(mockEvent, organizationId).sort()).toEqual(
      ['21072469-c909-43b9-9471-42b78b054ca2', '322eec6c-1b92-47c1-b79f-dea510ddf2dc'].sort(),
    );
  });
});
