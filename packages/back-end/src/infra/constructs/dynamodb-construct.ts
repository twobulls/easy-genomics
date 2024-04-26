import { RemovalPolicy } from 'aws-cdk-lib';
import { Attribute, AttributeType, BillingMode, SchemaOptions, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export const baseLSIAttributes: Attribute[] = [
  {
    name: 'CreatedAt',
    type: AttributeType.STRING,
  },
  {
    name: 'CreatedBy',
    type: AttributeType.STRING,
  },
  {
    name: 'ModifiedAt',
    type: AttributeType.STRING,
  },
  {
    name: 'ModifiedBy',
    type: AttributeType.STRING,
  },
];

export type DynamoDBTableDetails = {
  partitionKey: Attribute;
  sortKey?: Attribute;
  gsi?: SchemaOptions[];
  lsi?: Attribute[];
};

export interface DynamoConstructProps {
  devEnv?: boolean;
}

export class DynamoConstruct extends Construct {
  readonly props: DynamoConstructProps;

  constructor(scope: Construct, id: string, props: DynamoConstructProps) {
    super(scope, id);
    this.props = props;
  }

  public createTable = (envTableName: string, settings: DynamoDBTableDetails, devEnv?: boolean) => {
    const partitionKey = { name: settings.partitionKey.name, type: settings.partitionKey.type };
    const sortKey = settings.sortKey ? { name: settings.sortKey.name, type: settings.sortKey.type } : undefined;
    const removalPolicy = devEnv ? RemovalPolicy.DESTROY : undefined; // Only for Local, Sandbox, Dev

    const table = new Table(this, envTableName, {
      tableName: envTableName,
      partitionKey: partitionKey,
      sortKey: sortKey,
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: removalPolicy,
    });

    // Add Global Secondary Indexes if defined
    if (settings.gsi) {
      // NOTE: Global Secondary Indexes can be added / removed from the table as desired
      settings.gsi.forEach((value: SchemaOptions, _index: number, _array: SchemaOptions[]) => {
        table.addGlobalSecondaryIndex({
          indexName: `${value.partitionKey.name}_Index`,
          partitionKey: value.partitionKey,
          sortKey: value.sortKey, // Optional
        });
      });
    }

    // Add Local Secondary Indexes if table has an existing Sort Key
    if (sortKey && settings.lsi) {
      // NOTE: Local Secondary Indexes can only be defined at the initial table creation
      // and cannot be added / removed after the table has been created
      settings.lsi.forEach((value: Attribute, _index: number, _array: Attribute[]) => {
        table.addLocalSecondaryIndex({
          indexName: `${value.name}_Index`,
          sortKey: value,
        });
      });
    }

    return table;
  };
}
