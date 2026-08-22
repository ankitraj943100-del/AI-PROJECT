import { Router } from 'express';
import { handleAiChat } from '../controllers/aiController';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

router.post('/chat', authenticateJwt, handleAiChat);

export default router;
