import { Chunk } from '../types';
import { v4 as uuidv4 } from 'uuid'

export function chunkText(docId: string, text: string, maxTokens = 500, overlap = 50): Chunk[] {
  const sentences = text.split(/(?<=[\.\?\!\n])\s+/);
  const chunks: Chunk[] = [];
  let buffer = '';
  for (const s of sentences) {
    if ((buffer + ' ' + s).length > maxTokens) {
      chunks.push({ id: uuidv4(), docId, text: buffer.trim() });
      buffer = overlap > 0 ? buffer.split(' ').slice(-overlap).join(' ') + ' ' + s : s;
    } else {
      buffer = buffer ? buffer + ' ' + s : s;
    }
  }
  if (buffer.trim()) chunks.push({ id: uuidv4(), docId, text: buffer.trim() });
  return chunks;
}