// src/reservations/reservations.controller.ts
import { Request, Response } from 'express';
import { pool } from '../config/db';

/**
 * Crear una nueva reserva
 * Endpoint: POST /reservations
 */
export const createReservation = async (req: Request, res: Response): Promise<void> => {
  try {
    // Obtenemos los datos del body
    const { fecha, hora, restaurante_id } = req.body;
    // Obtenemos el ID del usuario autenticado (lo setea el authMiddleware)
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    // Aquí podrías agregar validaciones para evitar reservas duplicadas o que se excedan los límites.
    
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
 * Cancelar una reserva
 * Endpoint: DELETE /reservations/:id
 */
export const deleteReservation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    // Obtenemos el ID y el rol del usuario autenticado
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
