import { CreateUserInvitationRequestSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/user-invitation';
import {
  CreateUserForgotPasswordRequestSchema,
  ConfirmUserForgotPasswordRequestSchema,
} from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/user-password';
import { User } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
import { CreateUserInvitationRequest } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user-invitation';
import {
  ConfirmUserForgotPasswordRequest,
  CreateUserForgotPasswordRequest,
} from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user-password';
import { useRuntimeConfig } from 'nuxt/app';
import HttpFactory from '../factory';
const TEST_X_MIS_KEY = 'N1qV5jexwp7bQ0F33AdJc8WihZ5fsGbS1LcaemE1'; // Quality env

class UsersModule extends HttpFactory {
  $config = useRuntimeConfig();

  async list(): Promise<User | undefined> {
    return this.call<User>('GET', '/user/list-users');
  }

  async invite(orgId: string, email: string): Promise<CreateUserInvitationRequest | undefined> {
    CreateUserInvitationRequestSchema.parse({
      OrganizationId: orgId,
      Email: email,
    });

    return this.call<CreateUserInvitationRequest>('POST', '/user/create-user-invitation-request', {
      OrganizationId: orgId,
      Email: email,
    });
  }

  async forgotPasswordRequest(email: string): Promise<CreateUserForgotPasswordRequest | undefined> {
    CreateUserForgotPasswordRequestSchema.parse({
      Email: email,
    });

    return this.call<CreateUserForgotPasswordRequest>(
      'POST',
      '/user/create-user-forgot-password-request',
      {
        Email: email,
      },
      TEST_X_MIS_KEY
    );
  }

  async confirmForgotPasswordRequest(
    token: string,
    password: string
  ): Promise<ConfirmUserForgotPasswordRequest | undefined> {
    ConfirmUserForgotPasswordRequestSchema.parse({
      Token: token,
      Password: password,
    });
    return this.call<ConfirmUserForgotPasswordRequest>(
      'POST',
      '/user/confirm-user-forgot-password-request',
      {
        Token: token,
        Password: password,
      },
      TEST_X_MIS_KEY
    );
  }
}

export default UsersModule;
