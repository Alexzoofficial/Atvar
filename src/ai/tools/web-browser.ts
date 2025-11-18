'use server';

/**
 * @fileOverview A tool for fetching content from a web page using Alexzo Search.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ALEXZO_API_KEY = process.env.ALEXZO_API_KEY;

if (!ALEXZO_API_KEY) {
  console.warn('ALEXZO_API_KEY is not set. Web search will not work.');
}

export async function getPageContentFn(input: { query: string }) {
  try {
    const response = await fetch('https://alexzo.vercel.app/api/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ALEXZO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: input.query
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Alexzo Search API Error:', errorBody);
      return `Error: Could not fetch search results. API returned status: ${response.status}.`;
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return "No relevant results found for your query.";
    }

    const searchResults = data.results.slice(0, 5).map((item: any, idx: number) => (
      `${idx + 1}. Title: ${item.title}\n   URL: ${item.url}\n   Snippet: ${item.content}`
    )).join('\n\n');

    return `Here are the top search results:\n${searchResults}`;

  } catch (error) {
    console.error('Error fetching page content:', error);
    return 'Error: Failed to fetch or process the web search results.';
  }
}

export const getPageContent = ai.defineTool(
  {
    name: 'getPageContent',
    description: 'Searches the web using Alexzo Search for a given query and returns a summary of the top results. Use this for questions about current events, facts, or any topic that requires up-to-date information.',
    inputSchema: z.object({
      query: z.string().describe('The search query.'),
    }),
    outputSchema: z.string().describe('A summary of the top 5 search results, formatted as a string including titles, snippets, and links.'),
  },
  getPageContentFn
);
