import { Request, Response } from 'express';
import { ingestionQueue } from '../index';
import { v4 as uuidv4 } from 'uuid';

export async function ingestText(req: Request, res: Response) {
  try {
    const { text, docId, title, sourceType } = req.body as {
      text: string;
      docId?: string;
      title?: string;
      sourceType?: string;
    };

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid text field' });
    }

    const newDocId = docId || uuidv4();
    await ingestionQueue.add('ingest-text', {
      text,
      docId: newDocId,
      title,
      sourceType: sourceType || 'txt'
    });

    res.json({ status: 'queued', docId: newDocId });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}