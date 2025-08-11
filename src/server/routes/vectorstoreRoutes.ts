import { Router } from 'express';
import { store } from '../../config/vector';

const router = Router();

// POST /api/vectorstore/clear
router.post('/clear', async (req, res) => {
  try {
    if (typeof (store as any).client?.deleteCollection === 'function') {
      // For QdrantVectorStore: delete and recreate the collection
      const collectionName = (store as any).collectionName || 'chunks';
      await (store as any).client.deleteCollection(collectionName);
      await (store as any).ensureCollection();
      res.json({ status: 'ok', message: 'Vector store cleared.' });
    } else if (typeof (store as any).clear === 'function') {
      // For MemoryVectorStore: just clear
      await (store as any).clear();
      res.json({ status: 'ok', message: 'Memory vector store cleared.' });
    } else {
      res.status(500).json({ error: 'Clear operation not supported for this vector store.' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to clear vector store.' });
  }
});

export default router;
