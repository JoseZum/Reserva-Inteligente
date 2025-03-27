// src/orders/orders.controller.ts
import { Request, Response } from 'express';
import { pool } from '../config/db';

/**
 * Crear un nuevo pedido.
 * Endpoint: POST /orders
 */
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    const { reserva_id, menu_id, cantidad } = req.body;
    
    // Se puede agregar validación extra (por ejemplo, verificar existencia de reserva o menú)
    const result = await pool.query(
      'INSERT INTO pedidos (usuario_id, reserva_id, menu_id, cantidad) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, reserva_id || null, menu_id, cantidad]
    );
    
    res.status(201).json({ message: 'Pedido creado', order: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/**
 * Obtener detalles de un pedido.
 * Endpoint: GET /orders/:id
 */
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM pedidos WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Pedido no encontrado' });
      return;
    }
    
    res.status(200).json({ order: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/**
 * Actualizar un pedido.
 * Endpoint: PUT /orders/:id
 */
export const updateOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const { id } = req.params;
    const { reserva_id, menu_id, cantidad } = req.body;
    
    // Primero, verificamos que el pedido exista y obtenemos su creador.
    const existing = await pool.query('SELECT * FROM pedidos WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      res.status(404).json({ message: 'Pedido no encontrado' });
      return;
    }
    
    const order = existing.rows[0];
    // Solo el creador del pedido o un admin pueden actualizar.
    if (userRole !== 'admin' && order.usuario_id !== userId) {
      res.status(403).json({ message: 'No tienes permisos para actualizar este pedido' });
      return;
    }
    
    const result = await pool.query(
      'UPDATE pedidos SET reserva_id = $1, menu_id = $2, cantidad = $3 WHERE id = $4 RETURNING *',
      [reserva_id || null, menu_id, cantidad, id]
    );
    
    res.status(200).json({ message: 'Pedido actualizado', order: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/**
 * Eliminar un pedido.
 * Endpoint: DELETE /orders/:id
 */
export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const { id } = req.params;
    
    // Verificar que el pedido exista.
    const existing = await pool.query('SELECT * FROM pedidos WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      res.status(404).json({ message: 'Pedido no encontrado' });
      return;
    }
    
    const order = existing.rows[0];
    // Solo el creador o un admin pueden eliminar el pedido.
    if (userRole !== 'admin' && order.usuario_id !== userId) {
      res.status(403).json({ message: 'No tienes permisos para eliminar este pedido' });
      return;
    }
    
    const result = await pool.query('DELETE FROM pedidos WHERE id = $1 RETURNING *', [id]);
    
    res.status(200).json({ message: 'Pedido eliminado', order: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
