import { Router } from 'express';
import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  streamDocumentProgress,
} from '../controllers/documentController';
import { authenticateJwt } from '../middleware/auth';
import { uploadPdf } from '../middleware/upload';

const router = Router();

router.post('/upload', authenticateJwt, uploadPdf.single('file'), uploadDocument);
router.get('/', authenticateJwt, getDocuments);
router.get('/:id', authenticateJwt, getDocumentById);
router.get('/:id/progress', streamDocumentProgress);

export default router;
