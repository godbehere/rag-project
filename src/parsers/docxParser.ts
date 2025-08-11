import { readFile } from 'fs/promises';
import * as mammoth from 'mammoth';

export async function parseDOCX(filePath: string): Promise<string> {
  const buffer = await readFile(filePath);
  const { value } = await mammoth.extractRawText({ buffer });
  return value;
}