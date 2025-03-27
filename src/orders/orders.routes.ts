// src/orders/orders.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { createOrder, getOrderById, updateOrder, deleteOrder } from './orders.controller';

const router = Router();

// Todas las rutas requieren autenticación
router.post('/', authMiddleware, createOrder);
router.get('/:id', authMiddleware, getOrderById);
router.put('/:id', authMiddleware, updateOrder);
router.delete('/:id', authMiddleware, deleteOrder);

export default router;
