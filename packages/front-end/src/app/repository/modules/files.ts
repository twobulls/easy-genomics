import {
  RequestFileDownloadUrl,
  FileDownloadUrlResponse,
} from '@easy-genomics/shared-lib/src/app/types/easy-genomics/file/request-file-download-url';
import HttpFactory from '@FE/repository/factory';

class FilesModule extends HttpFactory {
  async requestFileDownloadUrl(req: RequestFileDownloadUrl): Promise<FileDownloadUrlResponse> {
    const res = await this.call<FileDownloadUrlResponse>('POST', '/file/request-file-download-url', req);

    if (!res) {
      throw new Error('Failed to request file download url');
    }

    return res;
  }
}

export default FilesModule;
