import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { getMenuById, updateMenu, deleteMenu } from './menus.controller';

const router = Router();

// GET /menus/:id - Detalle de un menú (público)
router.get('/:id', getMenuById);
// PUT /menus/:id - Actualizar menú (solo admin)
router.put('/:id', authMiddleware, updateMenu);
// DELETE /menus/:id - Eliminar menú (solo admin)
router.delete('/:id', authMiddleware, deleteMenu);

export default router;
