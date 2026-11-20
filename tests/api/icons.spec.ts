import { test, expect } from '@playwright/test';
import { collectIconUrls, getIconUrl, toAbsoluteUrl } from '../../api/icons';
import type { InstantAnswerResponse } from '../../api/types';

test.describe('Icon URL parsing (offline)', () => {
  test('treats empty or missing icon URLs as null', () => {
    expect(getIconUrl({ URL: '', Height: '', Width: '' })).toBeNull();
    expect(getIconUrl({ URL: '   ', Height: '', Width: '' })).toBeNull();
    expect(getIconUrl(undefined)).toBeNull();
    expect(getIconUrl({ URL: '/i/d58b5fe4.png', Height: '', Width: '' })).toBe('/i/d58b5fe4.png');
  });

  test('resolves relative URLs against duckduckgo.com', () => {
    expect(toAbsoluteUrl('/i/d58b5fe4.png')).toBe('https://duckduckgo.com/i/d58b5fe4.png');
    expect(toAbsoluteUrl('https://example.com/a.png')).toBe('https://example.com/a.png');
  });

  test('collects icons from top level, Results, RelatedTopics and nested Topics', () => {
    const icon = (URL: string) => ({ URL, Height: '', Width: '' });
    const response: InstantAnswerResponse = {
      Heading: 'Marvel',
      AbstractURL: '',
      Image: '',
      Icon: icon('/i/top.png'),
      Results: [{ FirstURL: 'https://marvel.com', Text: 'Official site', Result: '', Icon: icon('/i/result.png') }],
      RelatedTopics: [
        { FirstURL: 'https://duckduckgo.com/A', Text: 'A', Result: '', Icon: icon('/i/a.png') },
        { FirstURL: 'https://duckduckgo.com/B', Text: 'B', Result: '', Icon: icon('') },
        {
          Name: 'Group',
          Topics: [{ FirstURL: 'https://duckduckgo.com/C', Text: 'C and a description', Result: '<a href="https://duckduckgo.com/C">C</a>and a description', Icon: icon('/i/c.png') }],
        },
      ],
    };

    const icons = collectIconUrls(response);
    expect(icons.map((entry) => entry.url)).toEqual(['/i/top.png', '/i/result.png', '/i/a.png', '/i/c.png']);
    expect(icons.at(-1)?.source).toBe('Group > C');
  });
});
