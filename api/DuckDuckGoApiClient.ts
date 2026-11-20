import { expect, type APIRequestContext } from '@playwright/test';
import type { InstantAnswerResponse } from './types';

export class DuckDuckGoApiClient {
  constructor(private readonly request: APIRequestContext) {}

  async getInstantAnswer(query: string): Promise<InstantAnswerResponse> {
    const response = await this.request.get('/', {
      params: { q: query, format: 'json' },
    });

    // DDG often answers 202 with a full body, so the body is validated instead.
    expect([200, 202], `Unexpected HTTP status ${response.status()} for q=${query}`).toContain(response.status());

    const body = await response.text();
    expect(body.trim(), `Empty body for q=${query} (status ${response.status()}). Likely rate-limited.`).not.toBe('');

    try {
      // TODO(improve): validate the shape at runtime with a schema (e.g. zod) and retry with backoff on 429.
      return JSON.parse(body) as InstantAnswerResponse;
    } catch {
      throw new Error(`Response for q=${query} is not valid JSON. First 200 chars: ${body.slice(0, 200)}`);
    }
  }
}
