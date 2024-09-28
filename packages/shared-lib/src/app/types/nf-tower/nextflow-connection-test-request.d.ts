/**
 * The following internal NextFlow Connection Test Request model represents the
 * data required to test a connection with NextFlow Tower.
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
export interface NextFlowConnectionTestRequest {
  OrganizationId: string,
  LaboratoryId: string,
  WorkspaceId: string;
  AccessToken?: string;
}

/**
 * The following NextFlow Connection Test response model represents a successful response.
 */
export interface NextFlowConnectionTestResponse {
  Status: string;
}
