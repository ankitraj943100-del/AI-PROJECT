import { Router } from 'express';
import { registerUser, loginUser, getMe } from '../controllers/authController';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', authenticateJwt, getMe);

export default router;
