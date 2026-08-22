import { Router } from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

router.get('/doc/:documentId', authenticateJwt, getTasks);
router.post('/', authenticateJwt, createTask);
router.put('/:taskId', authenticateJwt, updateTask);
router.delete('/:taskId', authenticateJwt, deleteTask);

export default router;
