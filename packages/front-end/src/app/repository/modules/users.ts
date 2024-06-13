import { useRuntimeConfig } from 'nuxt/app';
import HttpFactory from '../factory';
import { CreateUserInvitationRequest } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user-invitation';
import { CreateUserInvitationRequestSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/user-invitation';
import {
  ConfirmUserForgotPasswordRequest,
  CreateUserForgotPasswordRequest,
} from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user-password';
import {
  CreateUserForgotPasswordRequestSchema,
  ConfirmUserForgotPasswordRequestSchema,
} from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/user-password';
import { User } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
const MOCK_X_API_KEY = 'JuCb97YCiV3AdCRBNgnuU2Fd7gFSwqa318wpjZ9H'; // Quality env

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
      MOCK_X_API_KEY
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
      MOCK_X_API_KEY
    );
  }
}

export default UsersModule;
