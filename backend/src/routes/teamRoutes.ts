import { Router } from 'express';
import { addTeamMember, getTeamMembers, removeTeamMember } from '../controllers/teamController';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

router.post('/add', authenticateJwt, addTeamMember);
router.get('/doc/:documentId', authenticateJwt, getTeamMembers);
router.delete('/:memberId', authenticateJwt, removeTeamMember);

export default router;
