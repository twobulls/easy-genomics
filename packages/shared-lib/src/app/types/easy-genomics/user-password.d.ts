/**
 * The following defines the DTO for the FE to submit requests to the
 * /easy-genomics/user/create-user-forgot-password-request API.
 *
 * {
 *   Email: <string>,
 * }
 */

export interface CreateUserForgotPasswordRequest {
  Email: string;
}

/**
 * The following defines the DTO for the FE to submit requests to the
 * /easy-genomics/user/confirm-user-forgot-password-request API.
 */
export interface ConfirmUserForgotPasswordRequest {
  Token: string;
  Password: string;
}
