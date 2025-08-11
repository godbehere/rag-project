import path from 'path';
import { parsePDF } from './pdfParser';
import { parseDOCX } from './docxParser';
import { parseTXT } from './txtParser';
import { parseWebsite } from './webParser';

export async function parseFile(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.pdf':
      return parsePDF(filePath);
    case '.doc':
    case '.docx':
      return parseDOCX(filePath);
    case '.txt':
      return parseTXT(filePath);
    default:
      throw new Error(`Unsupported file type: ${ext}`);
  }
}

export { parseWebsite };