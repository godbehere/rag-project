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
    $('script, style, noscript, iframe, meta, link, figure, .sidebar').remove();
    const wikiContent = $('.mw-parser-output'); // Checks for Wikipedia content
    const bodyText = wikiContent.text() || $('body').text();
    console.log('Parsed website content:', bodyText);
    let cleaned = cleanText(bodyText);
    console.log('Cleaned website content:', cleaned);
    return cleaned;
  } catch (error) {
    console.error('Error parsing website:', error);
    throw error;
  }
}
