/**
 * The following Connection Test Request model represents the data required to test
 * a connection with NextFlow Tower.
 *
 * If the AccessToken is not supplied, the Backend will retrieve the existing
 * AccessToken from SSM Parameter Store to verify the WorkspaceId is valid.
 *
 * {
 *   OrganizationId: <string>,
 *   LaboratoryId: <string>,
 *   WorkspaceId: <string>,
 *   AccessToken?: <string>,
 * }
 */

export interface RequestNextFlowConnectionTest {
  OrganizationId: string,
  LaboratoryId: string,
  WorkspaceId: string;
  AccessToken?: string;
}
