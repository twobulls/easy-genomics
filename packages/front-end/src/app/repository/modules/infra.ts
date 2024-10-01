import HttpFactory from '@FE/repository/factory';

class InfraModule extends HttpFactory {
  async s3Buckets(): Promise<string[]> {
    const res = await this.call<string[]>('GET', '/list-buckets');

    if (!res) {
      throw new Error('Failed to retrieve S3 Buckets');
    }

    return res;
  }
}

export default InfraModule;
