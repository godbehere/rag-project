import nlp from 'compromise';

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
  // Remove parentheticals, normalize punctuation, etc.
  let normalized = doc.normalize({punctuation: true, whitespace: true, parentheses: true}).out('text');

  // Optionally, filter out very short sentences
  const sentences = (nlp(normalized).sentences().out('array') as string[]).filter((s: string) => s.split(' ').length > 3);
  return sentences.join(' ');
}
