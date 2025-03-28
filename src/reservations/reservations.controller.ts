import { Request, Response } from 'express';
import { pool } from '../config/db';

/**
 * @swagger
 * components:
 *   schemas:
 *     Reservation:
 *       type: object
 *       required:
 *         - fecha
 *         - hora
 *         - usuario_id
 *         - restaurante_id
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the reservation
 *         fecha:
 *           type: string
 *           format: date
 *           description: The date of the reservation
 *         hora:
 *           type: string
 *           format: time
 *           description: The time of the reservation
 *         usuario_id:
 *           type: integer
 *           description: The ID of the user making the reservation
 *         restaurante_id:
 *           type: integer
 *           description: The ID of the restaurant
 */

/**
 * @swagger
 * /reservations:
 *   post:
 *     summary: Create a new reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fecha
 *               - hora
 *               - restaurante_id
 *             properties:
 *               fecha:
 *                 type: string
 *                 format: date
 *               hora:
 *                 type: string
 *                 format: time
 *               restaurante_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Reservation created successfully
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Server error
 */
export const createReservation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fecha, hora, restaurante_id } = req.body;
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    
    
    const result = await pool.query(
      'INSERT INTO reservas (fecha, hora, usuario_id, restaurante_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [fecha, hora, userId, restaurante_id]
    );
    res.status(201).json({ message: 'Reserva creada', reservation: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/**
 * @swagger
 * /reservations/{id}:
 *   delete:
 *     summary: Cancel a reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Reservation ID
 *     responses:
 *       200:
 *         description: Reservation canceled successfully
 *       403:
 *         description: Forbidden - No permission to cancel this reservation
 *       404:
 *         description: Reservation not found
 *       500:
 *         description: Server error
 */
export const deleteReservation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    
    // Primero, verificamos que la reserva exista
    const existing = await pool.query('SELECT * FROM reservas WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      res.status(404).json({ message: 'Reserva no encontrada' });
      return;
    }
    const reservation = existing.rows[0];
    
    // Solo el creador de la reserva o un admin puede cancelarla
    if (userRole !== 'admin' && reservation.usuario_id !== userId) {
      res.status(403).json({ message: 'No tienes permisos para cancelar esta reserva' });
      return;
    }
    
    const result = await pool.query('DELETE FROM reservas WHERE id = $1 RETURNING *', [id]);
    res.status(200).json({ message: 'Reserva cancelada', reservation: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
