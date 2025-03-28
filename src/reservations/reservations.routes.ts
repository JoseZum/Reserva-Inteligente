import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { createReservation, deleteReservation } from './reservations.controller';

const router = Router();

// Crear reserva: requiere autenticación
router.post('/', authMiddleware, createReservation);

// Cancelar reserva: requiere autenticación
router.delete('/:id', authMiddleware, deleteReservation);

export default router;
