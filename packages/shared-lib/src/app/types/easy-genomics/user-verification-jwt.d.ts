/**
 * The following defines the DTO for the BE to generate a signed User
 * Invitation / Forgot Password JWT to send to user to verify their request.
 */
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
