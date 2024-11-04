import { RemovalPolicy } from 'aws-cdk-lib';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { SqsSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import { Queue, QueueProps } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

export interface QueueDetails extends QueueProps {
  snsTopics: Topic[];
}

export interface Queues {
  [name: string]: QueueDetails;
}

export interface SqsConstructProps {
  namePrefix: string;
  devEnv?: boolean;
  queues: Queues;
}

export class SqsConstruct extends Construct {
  readonly props: SqsConstructProps;
  readonly sqsQueues = new Map<string, Queue>();

  constructor(scope: Construct, id: string, props: SqsConstructProps) {
    super(scope, id);
    this.props = props;

    Object.entries(this.props.queues).forEach(([name, queueDetails]: [string, QueueDetails]) => {
      this.createQueue(name, queueDetails);
    });
  }

  private createQueue = (name: string, queueDetails: QueueDetails) => {
    const removalPolicy = this.props.devEnv ? RemovalPolicy.DESTROY : undefined; // Only for Local, Sandbox, Dev

    const queue = new Queue(this, `${this.props.namePrefix}-${name}`, {
      ...queueDetails,
      queueName:
        queueDetails.fifo === true ? `${this.props.namePrefix}-${name}.fifo` : `${this.props.namePrefix}-${name}`,
      removalPolicy: removalPolicy,
    });

    // Subscribe SQS Queue to supplied SNS Topic(s)
    queueDetails.snsTopics.forEach((topic: Topic) => {
      topic.addSubscription(new SqsSubscription(queue));
    });

    // Add queue to collection of created Queues
    this.sqsQueues.set(name, queue);
  };
}
