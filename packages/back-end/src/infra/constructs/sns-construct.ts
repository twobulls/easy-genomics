import { Topic, TopicProps } from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';

export interface TopicDetails extends TopicProps {}

export interface Topics {
  [name: string]: TopicDetails;
}

export interface SnsConstructProps {
  namePrefix: string;
  topics: Topics;
}

export class SnsConstruct extends Construct {
  readonly props: SnsConstructProps;
  readonly snsTopics = new Map<string, Topic>();

  constructor(scope: Construct, id: string, props: SnsConstructProps) {
    super(scope, id);
    this.props = props;

    Object.entries(props.topics).forEach(([name, topicDetails]: [string, TopicDetails]) => {
      this.createTopic(name, topicDetails);
    });
  }

  private createTopic(name: string, topicDetails: TopicDetails) {
    const topic = new Topic(this, `${this.props.namePrefix}-${name}`, {
      ...topicDetails,
      topicName: `${this.props.namePrefix}-${name}`,
      displayName: `${this.props.namePrefix}-${name}`,
    });

    // Add topic to collection of created Topics
    this.snsTopics.set(name, topic);
  }
}
