import { OrganizationAccess, User } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
import { APIGatewayProxyEvent } from 'aws-lambda/trigger/api-gateway-proxy';
import {
  getLaboratoryAccessLaboratoryIds,
  validateLaboratoryManagerAccess,
  validateLaboratoryTechnicianAccess,
  verifyCurrentOrganizationAccess,
} from '../../../src/app/utils/auth-utils';

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

describe('verifyCurrentOrganizationAccess tests', () => {
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

  let mockUser: User = {
    UserId: 'mock-user-id',
    Email: 'fake@email.com',
    Status: 'Active',
    OrganizationAccess: undefined,
  };

  it('No authorizer claims, no user org access, no difference', () => {
    mockEvent.requestContext.authorizer = {};
    mockUser.OrganizationAccess = undefined;
    expect(verifyCurrentOrganizationAccess(mockEvent, mockUser)).toBeTruthy();
  });

  it('No authorizer claims, empty user org access, no difference', () => {
    mockEvent.requestContext.authorizer = {};
    const userOrganizationAccess: OrganizationAccess = {};
    mockUser.OrganizationAccess = userOrganizationAccess;
    expect(verifyCurrentOrganizationAccess(mockEvent, mockUser)).toBeTruthy();
  });

  it('Empty authorizer claims, empty user org access, no difference', () => {
    const authOrganizationAccess: OrganizationAccess = {};
    const userOrganizationAccess: OrganizationAccess = {};
    mockEvent.requestContext.authorizer = {
      claims: {
        OrganizationAccess: JSON.stringify(authOrganizationAccess),
      },
    };
    mockUser.OrganizationAccess = userOrganizationAccess;
    expect(verifyCurrentOrganizationAccess(mockEvent, mockUser)).toBeTruthy();
  });

  it('Empty authorizer claims, no user org access, no difference', () => {
    const authOrganizationAccess: OrganizationAccess = {};
    mockEvent.requestContext.authorizer = {
      claims: {
        OrganizationAccess: JSON.stringify(authOrganizationAccess),
      },
    };
    mockUser.OrganizationAccess = undefined;
    expect(verifyCurrentOrganizationAccess(mockEvent, mockUser)).toBeTruthy();
  });

  it('Identical simple authorizer claims and user org access, no difference', () => {
    mockUser.OrganizationAccess = {
      'da47e581-834b-4eb4-9c8d-23e83767522d': {
        Status: 'Active',
        LaboratoryAccess: {
          '11072469-c909-43b9-9471-42b78b054ca2': {
            Status: 'Active',
          },
        },
      },
    };
    const authOrganizationAccess: OrganizationAccess = mockUser.OrganizationAccess;
    mockEvent.requestContext.authorizer = {
      claims: {
        OrganizationAccess: JSON.stringify(authOrganizationAccess),
      },
    };

    expect(verifyCurrentOrganizationAccess(mockEvent, mockUser)).toBeTruthy();
  });

  it('Different authorizer claims and user org access, difference detected', () => {
    mockUser.OrganizationAccess = {
      'da47e581-834b-4eb4-9c8d-23e83767522d': {
        Status: 'Active',
        LaboratoryAccess: {
          '11072469-c909-43b9-9471-42b78b054ca2': {
            Status: 'Active',
          },
        },
      },
    };
    const authOrganizationAccess: OrganizationAccess = {
      'da47e581-834b-4eb4-9c8d-23e83767522d': {
        Status: 'Active',
        LaboratoryAccess: {
          '11072469-c909-43b9-9471-42b78b054ca2': {
            Status: 'Active',
          },
          '3bfb5ff6-2e2d-42ab-9f1d-dc93e6c7a0f9': {
            Status: 'Active',
          },
        },
      },
    };
    mockEvent.requestContext.authorizer = {
      claims: {
        OrganizationAccess: JSON.stringify(authOrganizationAccess),
      },
    };

    expect(verifyCurrentOrganizationAccess(mockEvent, mockUser)).toBeFalsy();
  });

  it('Identical complex authorizer claims and user org access, no difference', () => {
    mockUser.OrganizationAccess = {
      'ac04d32e-c44b-4691-8828-61dc66986b2f': {
        Status: 'Active',
        LaboratoryAccess: {
          '11072469-c909-43b9-9471-42b78b054ca2': {
            Status: 'Active',
            LabManager: true,
          },
          '243b3919-0ed8-4cde-bf3e-6d4b4dcaa838': {
            Status: 'Active',
            LabTechnician: true,
          },
          '3b5f2daa-072e-4fd2-8797-bc7a775e9105': {
            Status: 'Active',
          },
        },
      },
      'b1b61961-8844-44c2-922e-ca109329455a': {
        Status: 'Invited',
        LaboratoryAccess: {
          '9b2a5f8e-8272-4255-a5f0-8534e7369ec1': {
            Status: 'Active',
          },
        },
      },
    };

    mockEvent.requestContext.authorizer = {
      claims: {
        OrganizationAccess: JSON.stringify(mockUser.OrganizationAccess),
      },
    };

    expect(verifyCurrentOrganizationAccess(mockEvent, mockUser)).toBeTruthy();
  });

  it('Same complex authorizer claims and user org access with different order, no difference', () => {
    mockUser.OrganizationAccess = {
      'ac04d32e-c44b-4691-8828-61dc66986b2f': {
        Status: 'Active',
        LaboratoryAccess: {
          '11072469-c909-43b9-9471-42b78b054ca2': {
            Status: 'Active',
            LabManager: true,
          },
          '243b3919-0ed8-4cde-bf3e-6d4b4dcaa838': {
            Status: 'Active',
            LabTechnician: true,
          },
          '3b5f2daa-072e-4fd2-8797-bc7a775e9105': {
            Status: 'Active',
          },
        },
      },
    };

    const authOrganizationAccess: OrganizationAccess = {
      'ac04d32e-c44b-4691-8828-61dc66986b2f': {
        Status: 'Active',
        LaboratoryAccess: {
          '3b5f2daa-072e-4fd2-8797-bc7a775e9105': {
            Status: 'Active',
          },
          '243b3919-0ed8-4cde-bf3e-6d4b4dcaa838': {
            Status: 'Active',
            LabTechnician: true,
          },
          '11072469-c909-43b9-9471-42b78b054ca2': {
            Status: 'Active',
            LabManager: true,
          },
        },
      },
    };

    mockEvent.requestContext.authorizer = {
      claims: {
        OrganizationAccess: JSON.stringify(authOrganizationAccess),
      },
    };

    expect(verifyCurrentOrganizationAccess(mockEvent, mockUser)).toBeTruthy();
  });
});

describe('validateLaboratoryManagerAccess tests', () => {
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

  it('No authorizer claims, no access', () => {
    mockEvent.requestContext.authorizer = {};
    expect(
      validateLaboratoryManagerAccess(
        mockEvent,
        '8eb26467-6d9a-47c7-8c3e-85ab5e1ff936',
        '92436a7f-645f-4b47-9521-df7fb838c04f',
      ),
    ).toBeFalsy();
  });

  it('Empty authorizer claims, no access', () => {
    const organizationAccess: OrganizationAccess = {};
    mockEvent.requestContext.authorizer = {
      claims: {
        OrganizationAccess: JSON.stringify(organizationAccess),
      },
    };
    expect(
      validateLaboratoryManagerAccess(
        mockEvent,
        '8eb26467-6d9a-47c7-8c3e-85ab5e1ff936',
        '92436a7f-645f-4b47-9521-df7fb838c04f',
      ),
    ).toBeFalsy();
  });

  it('No access to requested org, no access', () => {
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

    expect(
      validateLaboratoryManagerAccess(
        mockEvent,
        '8eb26467-6d9a-47c7-8c3e-85ab5e1ff936',
        '92436a7f-645f-4b47-9521-df7fb838c04f',
      ),
    ).toBeFalsy();
  });

  it('Access to org but not lab, no access', () => {
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

    expect(
      validateLaboratoryManagerAccess(
        mockEvent,
        'da47e581-834b-4eb4-9c8d-23e83767522d',
        '92436a7f-645f-4b47-9521-df7fb838c04f',
      ),
    ).toBeFalsy();
  });

  it('Access to org and lab but no lab manager access, no access', () => {
    const organizationAccess: OrganizationAccess = {
      'ac04d32e-c44b-4691-8828-61dc66986b2f': {
        Status: 'Active',
        LaboratoryAccess: {
          '11072469-c909-43b9-9471-42b78b054ca2': {
            Status: 'Active',
            LabManager: true,
          },
          '243b3919-0ed8-4cde-bf3e-6d4b4dcaa838': {
            Status: 'Active',
            LabTechnician: true,
          },
          '3b5f2daa-072e-4fd2-8797-bc7a775e9105': {
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

    expect(
      validateLaboratoryManagerAccess(
        mockEvent,
        'ac04d32e-c44b-4691-8828-61dc66986b2f',
        '243b3919-0ed8-4cde-bf3e-6d4b4dcaa838',
      ),
    ).toBeFalsy();
  });

  it('Access to org and lab with lab manager access, user has access', () => {
    const organizationAccess: OrganizationAccess = {
      'ac04d32e-c44b-4691-8828-61dc66986b2f': {
        Status: 'Active',
        LaboratoryAccess: {
          '11072469-c909-43b9-9471-42b78b054ca2': {
            Status: 'Active',
            LabManager: true,
          },
          '243b3919-0ed8-4cde-bf3e-6d4b4dcaa838': {
            Status: 'Active',
            LabTechnician: true,
          },
          '3b5f2daa-072e-4fd2-8797-bc7a775e9105': {
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

    expect(
      validateLaboratoryManagerAccess(
        mockEvent,
        'ac04d32e-c44b-4691-8828-61dc66986b2f',
        '11072469-c909-43b9-9471-42b78b054ca2',
      ),
    ).toBeTruthy();
  });
});

describe('validateLaboratoryTechnicianAccess tests', () => {
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

  it('No authorizer claims, no access', () => {
    mockEvent.requestContext.authorizer = {};
    expect(
      validateLaboratoryTechnicianAccess(
        mockEvent,
        '8eb26467-6d9a-47c7-8c3e-85ab5e1ff936',
        '92436a7f-645f-4b47-9521-df7fb838c04f',
      ),
    ).toBeFalsy();
  });

  it('Empty authorizer claims, no access', () => {
    const organizationAccess: OrganizationAccess = {};
    mockEvent.requestContext.authorizer = {
      claims: {
        OrganizationAccess: JSON.stringify(organizationAccess),
      },
    };
    expect(
      validateLaboratoryTechnicianAccess(
        mockEvent,
        '8eb26467-6d9a-47c7-8c3e-85ab5e1ff936',
        '92436a7f-645f-4b47-9521-df7fb838c04f',
      ),
    ).toBeFalsy();
  });

  it('No access to requested org, no access', () => {
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

    expect(
      validateLaboratoryTechnicianAccess(
        mockEvent,
        '8eb26467-6d9a-47c7-8c3e-85ab5e1ff936',
        '92436a7f-645f-4b47-9521-df7fb838c04f',
      ),
    ).toBeFalsy();
  });

  it('Access to org but not lab, no access', () => {
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

    expect(
      validateLaboratoryTechnicianAccess(
        mockEvent,
        'da47e581-834b-4eb4-9c8d-23e83767522d',
        '92436a7f-645f-4b47-9521-df7fb838c04f',
      ),
    ).toBeFalsy();
  });

  it('Access to org and lab but no lab technician access, no access', () => {
    const organizationAccess: OrganizationAccess = {
      'ac04d32e-c44b-4691-8828-61dc66986b2f': {
        Status: 'Active',
        LaboratoryAccess: {
          '11072469-c909-43b9-9471-42b78b054ca2': {
            Status: 'Active',
            LabManager: true,
          },
          '243b3919-0ed8-4cde-bf3e-6d4b4dcaa838': {
            Status: 'Active',
            LabTechnician: true,
          },
          '3b5f2daa-072e-4fd2-8797-bc7a775e9105': {
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

    expect(
      validateLaboratoryTechnicianAccess(
        mockEvent,
        'ac04d32e-c44b-4691-8828-61dc66986b2f',
        '11072469-c909-43b9-9471-42b78b054ca2',
      ),
    ).toBeFalsy();
  });

  it('Access to org and lab with lab manager access, user has access', () => {
    const organizationAccess: OrganizationAccess = {
      'ac04d32e-c44b-4691-8828-61dc66986b2f': {
        Status: 'Active',
        LaboratoryAccess: {
          '11072469-c909-43b9-9471-42b78b054ca2': {
            Status: 'Active',
            LabManager: true,
          },
          '243b3919-0ed8-4cde-bf3e-6d4b4dcaa838': {
            Status: 'Active',
            LabTechnician: true,
          },
          '3b5f2daa-072e-4fd2-8797-bc7a775e9105': {
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

    expect(
      validateLaboratoryTechnicianAccess(
        mockEvent,
        'ac04d32e-c44b-4691-8828-61dc66986b2f',
        '243b3919-0ed8-4cde-bf3e-6d4b4dcaa838',
      ),
    ).toBeTruthy();
  });
});
