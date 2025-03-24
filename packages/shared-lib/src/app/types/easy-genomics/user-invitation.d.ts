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
 * The following defines the DTO for queued user invtation requests
 */
export interface QueuedUserInvitationRequest extends CreateUserInvitationRequest {
  CreatedBy: string;
}

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
export interface CreateBulkUserInvitationRequest {
  OrganizationId: string;
  Emails: string[];
}

/**
 * The following defines the DTO for the FE to submit requests to the
 * /easy-genomics/user/confirm-user-invitation-request API.
 */
export interface ConfirmUserInvitationRequest {
  Token: string;
  FirstName: string;
  LastName: string;
  Password: string;
}