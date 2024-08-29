/**
 * The following Connection Test model represents the data required to test 
 * a connection with NextFlow Tower.
 *
 * {
 *   WorkspaceId: <string>,
 *   AccessToken: <string>,
 * }
 */

export interface NFConnectionTest {
  WorkspaceId: string;
  AccessToken: string;
}
