// import { randomUUID } from 'crypto';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

jest.mock('aws-sdk');
const mockedClient = mockClient(DynamoDBClient);

// const testAccountId = '1234567890';
const testRegion = 'ap-southeast-1';
// let requestId = '';

beforeAll(() => {
  process.env.AWS_REGION = testRegion;
});

beforeEach(() => {
  mockedClient.reset();
  // requestId = randomUUID();
  console.error = jest.fn();
});

describe('List Organizations request tests', () => {

  it('should return an array of Organization objects', async () => {
    // TODO..
  });
});