/**
 * This DynamoDB Services Class is designed to provide a reusable DynamoDB
 * client to support database access instead of creating a new DynamoDB client
 * for each request.
 *
 * This class is intended to be extended by specific management classes to
 * manage the respective DynamoDB objects in their respective tables.
 *
 * e.g.
 *   - organization-service
 *   - user-service
 *   - organization-user-service
 *   - organization-laboratory-service
 *   - laboratory-user-service
 *   - etc...
 */
import {
  DeleteItemCommand,
  DeleteItemCommandInput,
  DeleteItemCommandOutput,
  DynamoDBClient,
  DynamoDBServiceException,
  GetItemCommand,
  GetItemCommandInput,
  GetItemCommandOutput,
  PutItemCommand,
  PutItemCommandInput,
  PutItemCommandOutput,
  ScanCommand,
  ScanCommandInput,
  ScanCommandOutput,
  UpdateItemCommand,
  UpdateItemCommandInput,
  UpdateItemCommandOutput,
} from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

enum DynamoDBCommand {
  PUT_ITEM = 'put-item', // Create
  SCAN_ITEMS = 'scan-items', // List
  GET_ITEM = 'get-item', // Read
  UPDATE_ITEM = 'update-item', // Update
  DELETE_ITEM = 'delete-item', // Delete
}

export class DynamoDBService {
  readonly dynamoDBDocClient;

  public constructor() {
    this.dynamoDBDocClient = DynamoDBDocumentClient.from(new DynamoDBClient());
  }

  protected findItem = async (getItemCommandInput: GetItemCommandInput): Promise<GetItemCommandOutput> => {
    return this.dynamoDBRequest<GetItemCommandInput, GetItemCommandOutput>(
      DynamoDBCommand.GET_ITEM,
      getItemCommandInput,
    );
  };

  protected findAll = async (scanCommandInput: ScanCommandInput): Promise<ScanCommandOutput> => {
    return this.dynamoDBRequest<ScanCommandInput, ScanCommandOutput>(DynamoDBCommand.SCAN_ITEMS, scanCommandInput);
  };

  protected putItem = async (putItemCommandInput: PutItemCommandInput): Promise<PutItemCommandOutput> => {
    return this.dynamoDBRequest<PutItemCommandInput, PutItemCommandOutput>(
      DynamoDBCommand.PUT_ITEM,
      putItemCommandInput,
    );
  };

  protected updateItem = async (updateItemCommandInput: UpdateItemCommandInput): Promise<UpdateItemCommandOutput> => {
    return this.dynamoDBRequest<UpdateItemCommandInput, UpdateItemCommandOutput>(
      DynamoDBCommand.UPDATE_ITEM,
      updateItemCommandInput,
    );
  };

  protected deleteItem = async (deleteItemCommandInput: DeleteItemCommandInput): Promise<DeleteItemCommandOutput> => {
    return this.dynamoDBRequest<DeleteItemCommandInput, DeleteItemCommandOutput>(
      DynamoDBCommand.DELETE_ITEM,
      deleteItemCommandInput,
    );
  };

  private dynamoDBRequest = async <RequestType, ResponseType>(
    command: DynamoDBCommand,
    data?: RequestType,
  ): Promise<ResponseType> => {
    try {
      console.log(
        `[dynamodb-service : dynamoDBRequest] accountId: ${process.env.AWS_ACCOUNT_ID}, region: ${process.env.AWS_REGION}, command: ${command}`,
      );

      return (await this.dynamoDBDocClient.send(this.getDynamoDBCommand(command, data))) as ResponseType;
    } catch (error: any) {
      console.error(
        `[dynamodb-service : dynamoDBRequest] accountId: ${process.env.AWS_ACCOUNT_ID}, region: ${process.env.AWS_REGION}, command: ${command} exception encountered:`,
        error,
      );
      throw this.handleError(error);
    }
  };

  private handleError = (error: any): DynamoDBServiceException => {
    return error as DynamoDBServiceException; // Base Exception
  };

  /**
   * Helper function returning the appropriate DynamoDB commands.
   *
   * @param command
   * @param data
   */
  private getDynamoDBCommand = <DynamoDBCommandInput>(command: DynamoDBCommand, data: DynamoDBCommandInput): any => {
    switch (command) {
      case DynamoDBCommand.PUT_ITEM:
        return new PutItemCommand(data);
      case DynamoDBCommand.SCAN_ITEMS:
        return new ScanCommand(data);
      case DynamoDBCommand.GET_ITEM:
        return new GetItemCommand(data);
      case DynamoDBCommand.UPDATE_ITEM:
        return new UpdateItemCommand(data);
      case DynamoDBCommand.DELETE_ITEM:
        return new DeleteItemCommand(data);
      default:
        throw new Error(`Unsupported DynamoDB Command '${command}'`);
    }
  };
}
