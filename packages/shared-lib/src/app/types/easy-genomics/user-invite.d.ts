/**
 * The following defines the DTO for the FE to submit requests to the
 * /easy-genomics/organization/user/create-user-invite API to invite a
 * new or existing user to an organization.
 *
 * {
 *   OrganizationId: <string>,
 *   Email: <string>,
 * }
 */

export interface CreateUserInvite {
  OrganizationId: string;
  Email: string;
}
