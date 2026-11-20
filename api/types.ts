
export interface Icon {
  URL: string;
  Height: string | number;
  Width: string | number;
}

export interface Topic {
  FirstURL: string;
  Icon: Icon;
  Result: string;
  Text: string;
}

export interface TopicGroup {
  Name: string;
  Topics: Topic[];
}

export type RelatedTopic = Topic | TopicGroup;

export interface InstantAnswerResponse {
  Heading: string;
  AbstractURL: string;
  Image: string;
  Icon?: Icon;
  Results: Topic[];
  RelatedTopics: RelatedTopic[];
}

export function isTopicGroup(topic: RelatedTopic): topic is TopicGroup {
  return 'Topics' in topic;
}
