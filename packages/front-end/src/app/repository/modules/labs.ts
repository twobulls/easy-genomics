import HttpFactory from '../factory';
// import { ICreateAccountInput, ICreateAccountResponse, ILoginInput, ILoginResponse } from 'types';

// TODO: base url, org id

class LabsModule extends HttpFactory {
  private RESOURCE = 'https://0pvmg09941.execute-api.ap-southeast-2.amazonaws.com/prod/easy-genomics/laboratory';

  async list(): Promise<ILoginResponse> {
    return this.call<ILoginResponse>(
      'GET',
      `${this.RESOURCE}/list-laboratories?organizationId=6a80b4fa-1cfe-4345-ae62-cdc58dbec69c`,
    );
  }

  // async postExample(orgId?: ILoginInput): Promise<ILoginResponse> {
  //   return await this.call<ILoginResponse>(
  //     'POST',
  //     `${this.RESOURCE}/list-laboratories?organizationId=6a80b4fa-1cfe-4345-ae62-cdc58dbec69c`,
  //     orgId
  //   );
  // }

  // async create(account: ICreateAccountInput): Promise<ICreateAccountResponse> {
  //   return await this.call<ICreateAccountResponse>('POST', `${this.RESOURCE}/register`, account);
  // }
}

export default LabsModule;
