import {
  FileUploadManifest,
  FileUploadRequest,
} from '@easy-genomics/shared-lib/src/app/types/easy-genomics/upload/s3-file-upload-manifest';
import { useRuntimeConfig } from 'nuxt/app';
import HttpFactory from '../factory';

class UploadsModule extends HttpFactory {
  $config = useRuntimeConfig();

  async getFileUploadManifest(req: FileUploadRequest): Promise<FileUploadManifest> {
    const res = await this.call<FileUploadManifest>('POST', '/upload/create-file-upload-request', req);

    if (!res) {
      throw new Error('Failed to retrieve file upload manifest');
    }

    return res;
  }
}

export default UploadsModule;
