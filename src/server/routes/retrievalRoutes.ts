import { Router } from 'express';
import { queryChunks } from '../controllers/retrievalController';

const router = Router();

router.post('/query', queryChunks);

export default router;
