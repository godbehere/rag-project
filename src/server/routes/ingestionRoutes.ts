import { Router } from 'express';
import { ingestText } from '../controllers/ingestionController';

const router = Router();
router.post('/ingest/text', ingestText);
export default router;