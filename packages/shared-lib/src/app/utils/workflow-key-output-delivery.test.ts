import { parseKeyOutputDeliveryUri } from './workflow-key-output-delivery';

describe('parseKeyOutputDeliveryUri', () => {
  it('accepts a bucket and prefix', () => {
    expect(parseKeyOutputDeliveryUri('s3://results-bucket/incoming/viralrecon')).toEqual({
      bucket: 'results-bucket',
      prefix: 'incoming/viralrecon/',
    });
  });

  it('accepts a bucket with no prefix', () => {
    expect(parseKeyOutputDeliveryUri('s3://results-bucket')).toEqual({
      bucket: 'results-bucket',
      prefix: '',
    });
  });

  it('rejects a missing bucket and a non-s3 URI, and drops a parent segment', () => {
    expect(parseKeyOutputDeliveryUri('s3:///incoming')).toBeNull();
    expect(parseKeyOutputDeliveryUri('s3://results-bucket/../secret')).toEqual({
      bucket: 'results-bucket',
      prefix: 'secret/',
    });
    expect(parseKeyOutputDeliveryUri('https://results-bucket/incoming')).toBeNull();
    expect(parseKeyOutputDeliveryUri('')).toBeNull();
  });
});
