
import { getPageContentFn } from '../web-browser';

describe('getPageContent', () => {
  const originalApiKey = process.env.ALEXZO_API_KEY;

  beforeEach(() => {
    process.env.ALEXZO_API_KEY = 'test-key';
  });

  afterEach(() => {
    process.env.ALEXZO_API_KEY = originalApiKey;
  });

  it('should fetch and format search results correctly from Alexzo Search API', async () => {
    const mockResponse = {
      results: [
        { title: 'Test Title 1', href: 'https://example.com/1', content: 'Test Snippet 1' },
        { title: 'Test Title 2', href: 'https://example.com/2', content: 'Test Snippet 2' },
      ],
    };

    // Mock the global fetch function
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    ) as jest.Mock;

    const input = { query: 'test' };
    const result = await getPageContentFn(input);

    const searchResults = [
      '1. Title: Test Title 1\n   URL: https://example.com/1\n   Snippet: Test Snippet 1',
      '2. Title: Test Title 2\n   URL: https://example.com/2\n   Snippet: Test Snippet 2',
    ].join('\n\n');

    const expectedOutput = `Here are the top search results:\n${searchResults}`;

    expect(result).toEqual(expectedOutput);
  });
});
