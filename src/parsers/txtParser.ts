import { readFile } from 'fs/promises';

export async function parseTXT(filePath: string): Promise<string> {
  return (await readFile(filePath, 'utf-8')).toString();
}