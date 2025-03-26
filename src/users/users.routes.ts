import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { getMe, updateUser, deleteUser } from './users.controller';

const router = Router();

router.get('/me', authMiddleware, getMe);
router.put('/:id', authMiddleware, updateUser);
router.delete('/:id', authMiddleware, deleteUser);

export default router;