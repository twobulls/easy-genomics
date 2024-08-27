import {
  APIGatewayClient,
  GetRestApisCommand,
  GetRestApisCommandInput,
  GetRestApisCommandOutput,
  RestApi,
} from '@aws-sdk/client-api-gateway';
import { ApiGatewayInfo } from '@SharedLib/types/api-gateway-info';

const apiGatewayClient: APIGatewayClient = new APIGatewayClient();

/**
 * Public utility to query API Gateway to obtain Easy Genomics' REST API URL.
 * @param apiGatewayRestApiName
 */
export async function getApiGatewayInfo(apiGatewayRestApiName: string, awsRegion: string): Promise<ApiGatewayInfo> {
  const restApis: RestApi[] = await listApiGatewayRestApis();
  const restApi: RestApi | undefined = restApis.find((r: RestApi) => r.name === apiGatewayRestApiName);

  if (!restApi || !restApi.id) {
    throw new Error(
      `Unable to obtain API Gateway REST API details: REST API Name '${apiGatewayRestApiName}' not found`,
    );
  } else {
    const apiGatewayInfo: ApiGatewayInfo = {
      RestApiUrl: `https://${restApi.id}.execute-api.${awsRegion}.amazonaws.com/prod`,
    };
    return apiGatewayInfo;
  }
}

/**
 * Private utility function to query API Gateway for a list of REST APIs.
 */
async function listApiGatewayRestApis(): Promise<RestApi[]> {
  const getRestApisCommand: GetRestApisCommand = new GetRestApisCommand({
    MaxResults: 10,
  } as GetRestApisCommandInput);

  const response: GetRestApisCommandOutput = await apiGatewayClient.send<
    GetRestApisCommandInput,
    GetRestApisCommandOutput
  >(getRestApisCommand);

  const restApis: RestApi[] | undefined = response.items;
  if (!restApis) {
    throw new Error('Unable to find any API Gateway REST APIs. Please check the Easy-Genomics Back-End deployment.');
  } else {
    return restApis;
  }
}
