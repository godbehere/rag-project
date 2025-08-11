import { Chunk } from '../types';
import { cleanText } from './cleaning';
import { v4 as uuidv4 } from 'uuid';

/**
 * Splits text into chunks by sentences with word overlap.
 * @param docId - ID of the document for chunk association.
 * @param text - Full text to chunk.
 * @param maxChunkLength - Approx max chunk length in characters (default 500).
 * @param wordOverlap - Number of words to overlap between chunks (default 50).
 * @returns Array of Chunk objects with id, docId, and chunk text.
 */
export function chunkText(
  docId: string,
  text: string,
  maxChunkLength = 500,
  wordOverlap = 50
): Chunk[] {
  // Clean the text before chunking
  const cleaned = cleanText(text);
  const sentences = cleaned.split(/(?<=[.?!\n])\s+/);
  const chunks: Chunk[] = [];
  let buffer = '';

  for (const sentence of sentences) {
    // If adding this sentence exceeds chunk length, push current chunk and start a new one
    if ((buffer + ' ' + sentence).trim().length > maxChunkLength) {
      chunks.push({ id: uuidv4(), docId, text: buffer.trim() });

      // Overlap last N words before starting new chunk
      const bufferWords = buffer.trim().split(' ');
      const overlapWords = bufferWords.slice(-wordOverlap).join(' ');
      buffer = overlapWords + ' ' + sentence;
    } else {
      buffer = buffer ? buffer + ' ' + sentence : sentence;
    }
  }

  // Push any remaining buffer as last chunk
  if (buffer.trim()) {
    chunks.push({ id: uuidv4(), docId, text: buffer.trim() });
  }

  return chunks;
}