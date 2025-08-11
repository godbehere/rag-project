import fetch from 'node-fetch';
import { load } from 'cheerio';
import { cleanText } from '../ingestion/cleaning';

export async function parseWebsite(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${url} - ${response.statusText}`);
    }
    const html = await response.text();

    const $ = load(html);
    $('script, style, noscript, iframe, meta, link').remove();
  const bodyText = $('body').text();
    return cleanText(bodyText);
  } catch (error) {
    console.error('Error parsing website:', error);
    throw error;
  }
}
