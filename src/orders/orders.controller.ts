import { Request, Response } from 'express';
import { pool } from '../config/db';

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       required:
 *         - menu_id
 *         - cantidad
 *         - usuario_id
 *         - restaurante_id
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the order
 *         menu_id:
 *           type: integer
 *           description: The ID of the menu item ordered
 *         cantidad:
 *           type: integer
 *           description: The quantity ordered
 *         usuario_id:
 *           type: integer
 *           description: The ID of the user placing the order
 *         restaurante_id:
 *           type: integer
 *           description: The ID of the restaurant
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - menu_id
 *               - cantidad
 *               - restaurante_id
 *             properties:
 *               menu_id:
 *                 type: integer
 *               cantidad:
 *                 type: integer
 *               restaurante_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Order created successfully
 *       500:
 *         description: Server error
 */
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { menu_id, cantidad, restaurante_id } = req.body;
    const userId = (req as any).user?.id;
    
    const result = await pool.query(
      'INSERT INTO pedidos (menu_id, cantidad, usuario_id, restaurante_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [menu_id, cantidad, userId, restaurante_id]
    );
    
    res.status(201).json({ message: 'Pedido creado', order: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get an order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
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
 * @swagger
 * /orders/{id}:
 *   put:
 *     summary: Update an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cantidad
 *             properties:
 *               cantidad:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       403:
 *         description: Forbidden - No permission to update this order
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
export const updateOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { cantidad } = req.body;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    
    // Verificar que el pedido exista
    const existing = await pool.query('SELECT * FROM pedidos WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      res.status(404).json({ message: 'Pedido no encontrado' });
      return;
    }
    
    const order = existing.rows[0];
    
    // Solo el dueño del pedido o un admin puede actualizarlo
    if (userRole !== 'admin' && order.usuario_id !== userId) {
      res.status(403).json({ message: 'No tienes permisos para actualizar este pedido' });
      return;
    }
    
    const result = await pool.query(
      'UPDATE pedidos SET cantidad = $1 WHERE id = $2 RETURNING *',
      [cantidad, id]
    );
    
    res.status(200).json({ message: 'Pedido actualizado', order: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     summary: Delete an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *       403:
 *         description: Forbidden - No permission to delete this order
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    
    // Verificar que el pedido exista
    const existing = await pool.query('SELECT * FROM pedidos WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      res.status(404).json({ message: 'Pedido no encontrado' });
      return;
    }
    
    const order = existing.rows[0];
    
    // Solo el dueño del pedido o un admin puede eliminarlo
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
