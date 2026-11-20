import { isTopicGroup, type Icon, type InstantAnswerResponse, type Topic } from './types';

export const DDG_ORIGIN = 'https://duckduckgo.com';

export interface IconEntry {
  source: string;
  url: string;
  absoluteUrl: string;
}

export function getIconUrl(icon: Icon | null | undefined): string | null {
  const url = icon?.URL?.trim();
  return url ? url : null;
}

export function toAbsoluteUrl(url: string): string {
  return new URL(url, DDG_ORIGIN).toString();
}

export function collectIconUrls(response: InstantAnswerResponse): IconEntry[] {
  const entries: IconEntry[] = [];

  const add = (source: string, icon: Icon | undefined) => {
    const url = getIconUrl(icon);
    if (url) entries.push({ source, url, absoluteUrl: toAbsoluteUrl(url) });
  };

  const topicName = (topic: Topic) => topic.Result?.match(/<a [^>]*>([^<]+)<\/a>/)?.[1] ?? topic.Text;

  add(response.Heading || 'top-level', response.Icon);
  for (const result of response.Results ?? []) add(topicName(result), result.Icon);

  for (const topic of response.RelatedTopics ?? []) {
    if (isTopicGroup(topic)) {
      for (const nested of topic.Topics) add(`${topic.Name} > ${topicName(nested)}`, nested.Icon);
    } else {
      add(topicName(topic), topic.Icon);
    }
  }

  return entries;
}
