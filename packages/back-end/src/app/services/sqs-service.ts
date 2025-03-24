import {
  ReceiveMessageCommand,
  ReceiveMessageCommandInput,
  ReceiveMessageCommandOutput,
  SQSClient,
  SQSServiceException,
} from '@aws-sdk/client-sqs';

export enum SqsCommand {
  RECEIVE_MESSAGE = 'receive-message',
}

export class SqsService {
  private readonly sqsClient;

  public constructor() {
    this.sqsClient = new SQSClient();
  }

  public sendMessage = async (
    receiveMessageCommandInput: ReceiveMessageCommandInput,
  ): Promise<ReceiveMessageCommandOutput> => {
    return this.sqsRequest<ReceiveMessageCommandInput, ReceiveMessageCommandOutput>(
      SqsCommand.RECEIVE_MESSAGE,
      receiveMessageCommandInput,
    );
  };

  private sqsRequest = async <RequestType, ResponseType>(
    command: SqsCommand,
    data?: RequestType,
  ): Promise<ResponseType> => {
    try {
      return await this.sqsClient.send(this.getSqsCommand(command, data));
    } catch (error: any) {
      console.error(`[sqs-service : sqsRequest] command: ${command} exception encountered:`, error);
      throw this.handleError(error);
    }
  };

  private handleError = (error: any): SQSServiceException => {
    return error as SQSServiceException; // Base Exception
  };

  private getSqsCommand = <SqsCommandInput>(command: SqsCommand, data: SqsCommandInput): any => {
    switch (command) {
      case SqsCommand.RECEIVE_MESSAGE:
        return new ReceiveMessageCommand(data);
      default:
        throw new Error(`Unsupported SQS Management Command '${command}'`);
    }
  };
}
