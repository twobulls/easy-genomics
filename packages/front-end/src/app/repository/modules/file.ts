import { FileDownloadUrlResponseSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/file/request-file-download-url';
import { S3ResponseSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/file/request-list-bucket-objects';
import {
  RequestFileDownloadUrl,
  FileDownloadUrlResponse,
} from '@easy-genomics/shared-lib/src/app/types/easy-genomics/file/request-file-download-url';
import {
  RequestListBucketObjects,
  S3Response,
} from '@easy-genomics/shared-lib/src/app/types/easy-genomics/file/request-list-bucket-objects';
import HttpFactory from '@FE/repository/factory';
import { validateApiResponse } from '@FE/utils/api-utils';

class FileModule extends HttpFactory {
  /**
   * Request file download URL
   * @param req
   */
  async requestFileDownloadUrl(req: RequestFileDownloadUrl): Promise<FileDownloadUrlResponse> {
    const res = await this.call<FileDownloadUrlResponse>('POST', '/file/request-file-download-url', req);

    if (!res) {
      console.error('Error calling file download API');
      throw new Error('Failed to perform file download');
    }
    validateApiResponse(FileDownloadUrlResponseSchema, res);
    return res;
  }

  /**
   * Request list of objects in an S3 bucket
   * @param req
   */
  async requestListBucketObjects(req: RequestListBucketObjects): Promise<S3Response> {
    const res = await this.call<S3Response>('POST', '/file/request-list-bucket-objects', req);

    if (!res) {
      console.error('Error calling file download API');
      throw new Error('Failed to perform file download');
    }

    validateApiResponse(S3ResponseSchema, res);
    return res;
  }
}

export default FileModule;
