/**
 * The following defines the DTOs for the BE to generate a signed User
 * Invitation / Forgot Password JWT to send to user to verify their request.
 */
export interface UserInvitationJwt {
  RequestType: 'NewUserInvitation' | 'ResendNewUserInvitation' | 'ExistingUserInvitation';
  Verification: string;
  Email: string;
  OrganizationId: string;
  TemporaryPassword?: string; // Cognito generated and encrypted temporary password
  CreatedAt: number;
}

export interface UserForgotPasswordJwt {
  RequestType: 'UserForgotPassword';
  Verification: string;
  Email: string;
  Code: string; // Cognito generated and encrypted code
  CreatedAt: number;
}
