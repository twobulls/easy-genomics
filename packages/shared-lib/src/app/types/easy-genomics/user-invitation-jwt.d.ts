/**
 * The following defines the DTO for the BE to generate a signed User Invitation
 * JWT to send to user to verify their invitation acceptance.
 *
 * {
 *   InvitationCode: <string>,
 *   OrganizationId: <string>,
 *   OrganizationName: <string>,
 *   Email: <string>,
 *   CreatedAt: number,
 * }
 */

export type UserInvitationJwt = {
  InvitationCode: string;
  OrganizationId: string;
  OrganizationName: string;
  Email: string;
  CreatedAt: number;
}