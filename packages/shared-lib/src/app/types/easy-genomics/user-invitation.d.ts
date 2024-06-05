/**
 * The following defines the DTO for the FE to submit requests to the
 * /easy-genomics/user/create-user-invitation-request API to invite a new or
 * existing user to an organization.
 *
 * {
 *   OrganizationId: <string>,
 *   Email: <string>,
 * }
 */
export interface CreateUserInvitationRequest {
  OrganizationId: string;
  Email: string;
}

/**
 * The following defines the DTO for the FE to submit requests to the
 * /easy-genomics/user/update-user-invitation-request API.
 */
export interface UpdateUserInvitationRequest {
  Token: string;
  FirstName: string;
  LastName: string;
  Password: string;
}