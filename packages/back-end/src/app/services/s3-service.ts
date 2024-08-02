import {
  AbortMultipartUploadCommand,
  AbortMultipartUploadCommandInput,
  CompleteMultipartUploadCommand,
  CompleteMultipartUploadCommandInput,
  CopyObjectCommand,
  CopyObjectCommandInput,
  CreateBucketCommand,
  CreateBucketCommandInput,
  CreateBucketCommandOutput,
  CreateMultipartUploadCommand,
  CreateMultipartUploadCommandInput,
  DeleteBucketCommand,
  DeleteBucketCommandInput,
  DeleteBucketCommandOutput,
  DeleteObjectCommand,
  DeleteObjectCommandInput,
  ExpirationStatus,
  GetBucketLocationCommand,
  GetBucketLocationCommandInput,
  GetBucketLocationCommandOutput,
  HeadObjectCommand,
  HeadObjectCommandInput,
  HeadObjectCommandOutput,
  InvalidObjectState,
  ListBucketsCommand,
  ListBucketsCommandInput,
  ListBucketsCommandOutput,
  ListMultipartUploadsCommand,
  ListMultipartUploadsCommandInput,
  ListObjectsV2Command,
  ListObjectsV2CommandInput,
  ListPartsCommand,
  ListPartsCommandInput,
  NoSuchBucket,
  NoSuchKey,
  NoSuchUpload,
  NotFound,
  ObjectNotInActiveTierError,
  PutBucketCorsCommand,
  PutBucketCorsCommandInput,
  PutBucketCorsCommandOutput,
  PutBucketLifecycleConfigurationCommand,
  PutBucketLifecycleConfigurationCommandInput,
  PutBucketLifecycleConfigurationCommandOutput,
  PutObjectCommand,
  PutObjectCommandInput,
  PutObjectCommandOutput,
  S3Client,
  S3ServiceException,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export enum S3Command {
  // Manage S3 Bucket
  CREATE_BUCKET = 'create-bucket',
  DELETE_BUCKET = 'delete-bucket',
  LIST_BUCKETS = 'list-buckets',
  GET_BUCKET_LOCATION = 'get-bucket-location',
  PUT_BUCKET_CORS = 'put-bucket-cors',
  PUT_BUCKET_LIFECYCLE_CONFIGURATION = 'put-bucket-lifecycle-configuration',
  // Manage S3 Bucket objects
  COPY_BUCKET_OBJECT = 'copy-bucket-object',
  DELETE_BUCKET_OBJECT = 'delete-bucket-object',
  LIST_BUCKET_OBJECTS = 'list-bucket-objects',
  HEAD_OBJECT = 'head-object',
  PUT_OBJECT = 'put-object',
  // Multi-Part S3 Uploads
  CREATE_MULTI_PART_UPLOAD = 'create-multi-part-upload',
  ABORT_MULTI_PART_UPLOAD = 'abort-multi-part-upload',
  LIST_MULTI_PART_UPLOAD_PARTS = 'list-multi-part-upload-parts',
  LIST_MULTI_PART_UPLOAD_REQUESTS = 'list-multi-part-upload-requests',
  COMPLETE_MULTI_PART_UPLOAD = 'complete-multi-part-upload',
}

export class S3Service {
  private readonly s3Client;

  public constructor() {
    this.s3Client = new S3Client();
  }

  public createBucket = async (createBucketInput: CreateBucketCommandInput): Promise<CreateBucketCommandOutput> => {
    // Create S3 Bucket
    const createBucketCommandOutput: CreateBucketCommandOutput = await this.s3Request<
    CreateBucketCommandInput,
    CreateBucketCommandOutput
    >(S3Command.CREATE_BUCKET, createBucketInput);

    // Set S3 Bucket CORS configuration
    const putBucketCorsCommandInput: PutBucketCorsCommandInput = {
      Bucket: createBucketInput.Bucket,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedMethods: ['GET', 'PUT', 'POST', 'HEAD'],
            AllowedOrigins: ['*'], // TODO: Restrict to domain in configuration file
            AllowedHeaders: ['*'],
          },
        ],
      },
    };
    await this.s3Request<PutBucketCorsCommandInput, PutBucketCorsCommandOutput>(
      S3Command.PUT_BUCKET_CORS,
      putBucketCorsCommandInput,
    );

    // Set S3 Bucket Lifecycle Rules
    const putBucketLifecycleConfigurationCommandInput: PutBucketLifecycleConfigurationCommandInput = {
      Bucket: createBucketInput.Bucket,
      LifecycleConfiguration: {
        Rules: [
          {
            Prefix: 'uploads',
            Status: ExpirationStatus.Enabled,
            AbortIncompleteMultipartUpload: {
              DaysAfterInitiation: 2,
            },
          },
        ],
      },
    };
    await this.s3Request<PutBucketLifecycleConfigurationCommandInput, PutBucketLifecycleConfigurationCommandOutput>(
      S3Command.PUT_BUCKET_LIFECYCLE_CONFIGURATION,
      putBucketLifecycleConfigurationCommandInput,
    );

    return createBucketCommandOutput;
  };

  public deleteBucket = async (deleteBucketInput: DeleteBucketCommandInput): Promise<DeleteBucketCommandOutput> => {
    return this.s3Request<DeleteBucketCommandInput, DeleteBucketCommandOutput>(
      S3Command.DELETE_BUCKET,
      deleteBucketInput,
    );
  };

  public listBuckets = async (listBucketsInput: ListBucketsCommandInput): Promise<ListBucketsCommandOutput> => {
    return this.s3Request<ListBucketsCommandInput, ListBucketsCommandOutput>(S3Command.LIST_BUCKETS, listBucketsInput);
  };

  public getBucketLocation = async (
    getBucketLocationInput: GetBucketLocationCommandInput,
  ): Promise<GetBucketLocationCommandOutput> => {
    return this.s3Request<GetBucketLocationCommandInput, GetBucketLocationCommandOutput>(
      S3Command.GET_BUCKET_LOCATION,
      getBucketLocationInput,
    );
  };

  public getPreSignedUploadUrl = async (putObjectInput: PutObjectCommandInput): Promise<string> => {
    const putObjectCommand: PutObjectCommand = new PutObjectCommand(putObjectInput);
    return getSignedUrl(this.s3Client, putObjectCommand, { expiresIn: 3600 });
  };

  public doesObjectExist = async (headObjectInput: HeadObjectCommandInput): Promise<boolean> => {
    try {
      const response = await this.s3Request<HeadObjectCommandInput, HeadObjectCommandOutput>(
        S3Command.HEAD_OBJECT,
        headObjectInput,
      );
      return response.$metadata.httpStatusCode === 200;
    } catch (error: any) {
      return false;
    }
  };

  public putObject = async (putObjectInput: PutObjectCommandInput): Promise<PutObjectCommandOutput> => {
    return this.s3Request<PutObjectCommandInput, PutObjectCommandOutput>(S3Command.PUT_OBJECT, putObjectInput);
  };

  private s3Request = async <RequestType, ResponseType>(
    command: S3Command,
    data?: RequestType,
  ): Promise<ResponseType> => {
    try {
      console.log(
        `[s3-service : s3Request] accountId: ${process.env.ACCOUNT_ID}, region: ${process.env.REGION}, command: ${command}`,
      );

      return await this.s3Client.send(this.getS3Command(command, data));
    } catch (error: any) {
      console.error(
        `[s3-service : s3Request] accountId: ${process.env.ACCOUNT_ID}, region: ${process.env.REGION}, command: ${command} exception encountered:`,
        error,
      );
      throw this.handleError(error);
    }
  };

  private handleError = (error: any): S3ServiceException => {
    if (error instanceof NoSuchUpload) {
      return error as NoSuchUpload;
    } else if (error instanceof ObjectNotInActiveTierError) {
      return error as ObjectNotInActiveTierError;
    } else if (error instanceof InvalidObjectState) {
      return error as InvalidObjectState;
    } else if (error instanceof NoSuchKey) {
      return error as NoSuchKey;
    } else if (error instanceof NotFound) {
      return error as NotFound;
    } else if (error instanceof NoSuchBucket) {
      return error as NoSuchBucket;
    } else {
      return error as S3ServiceException; // Base Exception
    }
  };

  /**
   * Helper function returning the appropriate S3 commands.
   *
   * @param command
   * @param data
   */
  private getS3Command = (command: S3Command, data: any): any => {
    switch (command) {
      // S3 Bucket Commands
      case S3Command.CREATE_BUCKET:
        return new CreateBucketCommand(data as CreateBucketCommandInput);
      case S3Command.LIST_BUCKETS:
        return new ListBucketsCommand(data as ListBucketsCommandInput);
      case S3Command.DELETE_BUCKET:
        return new DeleteBucketCommand(data as DeleteBucketCommandInput);
      case S3Command.GET_BUCKET_LOCATION:
        return new GetBucketLocationCommand(data as GetBucketLocationCommandInput);
      case S3Command.PUT_BUCKET_CORS:
        return new PutBucketCorsCommand(data as PutBucketCorsCommandInput);
      case S3Command.PUT_BUCKET_LIFECYCLE_CONFIGURATION:
        return new PutBucketLifecycleConfigurationCommand(data as PutBucketLifecycleConfigurationCommandInput);
      // S3 Bucket Object Commands
      case S3Command.COPY_BUCKET_OBJECT:
        return new CopyObjectCommand(data as CopyObjectCommandInput);
      case S3Command.DELETE_BUCKET_OBJECT:
        return new DeleteObjectCommand(data as DeleteObjectCommandInput);
      case S3Command.LIST_BUCKET_OBJECTS:
        return new ListObjectsV2Command(data as ListObjectsV2CommandInput);
      case S3Command.HEAD_OBJECT:
        return new HeadObjectCommand(data as HeadObjectCommandInput);
      case S3Command.PUT_OBJECT:
        return new PutObjectCommand(data as PutObjectCommandInput);
      // Multi-Part S3 Upload Commands
      case S3Command.CREATE_MULTI_PART_UPLOAD:
        return new CreateMultipartUploadCommand(data as CreateMultipartUploadCommandInput);
      case S3Command.ABORT_MULTI_PART_UPLOAD:
        return new AbortMultipartUploadCommand(data as AbortMultipartUploadCommandInput);
      case S3Command.LIST_MULTI_PART_UPLOAD_PARTS:
        return new ListPartsCommand(data as ListPartsCommandInput);
      case S3Command.LIST_MULTI_PART_UPLOAD_REQUESTS:
        return new ListMultipartUploadsCommand(data as ListMultipartUploadsCommandInput);
      case S3Command.COMPLETE_MULTI_PART_UPLOAD:
        return new CompleteMultipartUploadCommand(data as CompleteMultipartUploadCommandInput);
      default:
        throw new Error(`Unsupported S3 Management Command '${command}'`);
    }
  };
}
