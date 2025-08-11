import nlp from 'compromise';

// Simple stopword/filler list (expand as needed)
const STOPWORDS = [
  'click here', 'copyright', 'all rights reserved', 'terms of service', 'privacy policy',
  'login', 'sign up', 'subscribe', 'menu', 'home', 'contact us', 'about us', 'faq', 'help',
];

function isMostlyNumbersOrSymbols(s: string): boolean {
  const alpha = s.replace(/[^a-zA-Z]/g, '');
  return alpha.length < s.length * 0.3;
}

function isURLorBoilerplate(s: string): boolean {
  return /https?:\/\//.test(s) || STOPWORDS.some(w => s.toLowerCase().includes(w));
}

/**
 * Cleans and normalizes text using NLP techniques.
 * - Removes extra whitespace, non-printable chars, and normalizes punctuation.
 * - Optionally, can filter out very short/irrelevant sentences.
 * @param text Raw input text
 * @returns Cleaned text
 */
export function cleanText(text: string): string {
  let cleaned = text.replace(/[\x00-\x1F\x7F]+/g, ' '); // Remove non-printable
  cleaned = cleaned.replace(/\s+/g, ' ').trim(); // Collapse whitespace

  // Use compromise for further normalization
  const doc = nlp(cleaned);
  let normalized = doc.normalize({punctuation: true, whitespace: true, parentheses: true}).out('text');

  // Split into sentences and apply advanced filtering
  let sentences = (nlp(normalized).sentences().out('array') as string[])
    .map(s => s.trim())
    .filter(s => s.length > 0)
    // Remove very short sentences
    .filter(s => s.split(' ').length > 3)
    // Remove sentences that are mostly numbers/symbols
    .filter(s => !isMostlyNumbersOrSymbols(s))
    // Remove URLs and boilerplate
    .filter(s => !isURLorBoilerplate(s));

  // Deduplicate sentences (case-insensitive)
  const seen = new Set<string>();
  sentences = sentences.filter(s => {
    const key = s.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return sentences.join(' ');
}
