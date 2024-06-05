/**
 * The following defines the DTO for the BE to generate a signed User
 * Verification JWT to send to user to verify their request acceptance.
 *
 * This generic/alias type definition supports:
 *  - New User Invitation to the Platform and an Organization
 *  - Existing User Invitation to an Organization
 *  - Existing User Forgot Password
 */
export type UserVerificationJwt = UserInvitationJwt | UserForgotPasswordJwt;

export interface UserInvitationJwt {
  RequestType: 'UserInvitation';
  Verification: string;
  Email: string;
  OrganizationId: string;
  CreatedAt: number;
}

export interface UserForgotPasswordJwt {
  RequestType: 'UserForgotPassword';
  Verification: string;
  Email: string;
  Code: string;
  CreatedAt: number;
}
