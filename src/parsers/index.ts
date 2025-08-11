import path from 'path';
import { parsePDF } from './pdfParser';
import { parseDOCX } from './docxParser';
import { parseTXT } from './txtParser';
import { parseWebsite } from './webParser';
import { logInfo } from '../config/logger';

export async function parseFile(filePath: string, originalName: string): Promise<string> {
  const ext = path.extname(originalName).toLowerCase();
  logInfo(`Parsing file: ${originalName} with extension: ${ext}`);
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