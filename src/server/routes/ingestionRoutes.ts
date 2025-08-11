import { Router } from 'express';
import { ingestText, ingestionFilesMiddleware, ingestFilesAndUrls } from '../controllers/ingestionController';

const router = Router();

router.post('/ingest/text', ingestText);
router.post('/ingest/files', ingestionFilesMiddleware, ingestFilesAndUrls);

export default router;