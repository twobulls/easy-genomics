import { Topic, TopicProps } from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';

export interface TopicDetails extends TopicProps {}

export interface SnsConstructProps {
  namePrefix: string;
  topics: Map<string, TopicDetails>;
}

export class SnsConstruct extends Construct {
  readonly props: SnsConstructProps;
  readonly snsTopics = new Map<string, Topic>();

  constructor(scope: Construct, id: string, props: SnsConstructProps) {
    super(scope, id);
    this.props = props;

    props.topics.forEach((topicDetails: TopicDetails, name: string) => this.createTopic(name, topicDetails));
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
