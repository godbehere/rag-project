import { Request, Response } from 'express';
import multer from 'multer';
import { ingestionQueue } from '../index';
import { v4 as uuidv4 } from 'uuid';
import { parseFile, parseWebsite } from '../../parsers';
import fs from 'fs';
// import path from 'path';
// import { chunkText } from '../../ingestion/chunker';
import { logInfo, logError } from '../../config/logger';

const upload = multer({ dest: 'uploads/' });

export const ingestionFilesMiddleware = upload.array('files');

export async function ingestText(req: Request, res: Response) {
  try {
    const { text, docId, source, sourceType } = req.body as {
      text: string;
      docId?: string;
      source?: string;
      sourceType?: string;
    };

    if (!text || typeof text !== 'string') {
      logError('IngestText: Missing or invalid text field', req.body);
      return res.status(400).json({ error: 'Missing or invalid text field' });
    }

    const newDocId = docId || uuidv4();

    logInfo('IngestText: Queueing doc', { docId: newDocId, source, sourceType });
    
    await ingestionQueue.add('ingest-doc', {
      docId: newDocId,
      text,
      source,
      sourceType: sourceType || 'txt',
    });

    res.json({ status: 'queued', docId: newDocId });
  } catch (err: any) {
    logError('IngestText error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function ingestFilesAndUrls(req: Request, res: Response) {
  try {
    const files = (req.files as Express.Multer.File[]) || [];
    let urls: string[] = [];
    if (req.body.urls) {
      try {
        urls = Array.isArray(req.body.urls)
          ? req.body.urls
          : JSON.parse(req.body.urls);
      } catch {
        logError('IngestFilesAndUrls: Invalid URLs format', req.body.urls);
        return res.status(400).json({ error: 'Invalid URLs format' });
      }
    }

    // Validate URLs
    const validUrls = urls.filter((url) => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    });
    if (validUrls.length !== urls.length) {
      logError('IngestFilesAndUrls: One or more URLs are invalid', urls);
      return res.status(400).json({ error: 'One or more URLs are invalid' });
    }

    // Parse files and clean up after
    const fileTexts = await Promise.all(
      files.map(async (file) => {
        try {
          const text = await parseFile(file.path, file.originalname);
          return { docId: uuidv4(), text, filePath: file.path, source: file.originalname };
        } catch (err) {
          return { error: `Failed to parse file: ${file.originalname}` };
        } finally {
          // Remove uploaded file
          fs.unlink(file.path, () => {});
        }
      })
    );

    // Parse websites
    const urlTexts = await Promise.all(
      validUrls.map(async (url: string) => {
        try {
          const text = await parseWebsite(url);
          return { docId: uuidv4(), text, source: url };
        } catch (err) {
          return { error: `Failed to parse URL: ${url}` };
        }
      })
    );

    logInfo('File texts and URL texts parsed', {
      fileCount: fileTexts.length,
      urlCount: urlTexts.length,
      errors: [...fileTexts, ...urlTexts].filter((d) => 'error' in d),
      total: fileTexts.length + urlTexts.length,
      files: fileTexts.map((f) => f.docId),
      urls: urlTexts.map((u) => u.docId),
    });

    // Filter out failed parses
    const allDocs = [...fileTexts, ...urlTexts].filter((d) => !('error' in d));
    const errors = [...fileTexts, ...urlTexts].filter((d) => 'error' in d).map((d) => d.error);

    // Enqueue one job per document with full text
    for (const { docId, text, source } of allDocs) {
      logInfo('IngestFilesAndUrls: Queueing doc', { docId });
      await ingestionQueue.add('ingest-doc', {
        docId,
        text,
        source,
        sourceType: 'file/url',
      });
    }

    res.status(200).json({ message: 'Ingestion jobs queued', count: allDocs.length, errors });
  } catch (error: any) {
    logError('IngestFilesAndUrls error', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
