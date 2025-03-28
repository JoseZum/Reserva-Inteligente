import { Request, Response } from 'express';
import { pool } from '../config/db';

/**
 * @swagger
 * components:
 *   schemas:
 *     Restaurant:
 *       type: object
 *       required:
 *         - nombre
 *         - direccion
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the restaurant
 *         nombre:
 *           type: string
 *           description: The name of the restaurant
 *         direccion:
 *           type: string
 *           description: The address of the restaurant
 */

/**
 * @swagger
 * /restaurants:
 *   post:
 *     summary: Create a new restaurant (admin only)
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - direccion
 *             properties:
 *               nombre:
 *                 type: string
 *               direccion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Restaurant created successfully
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
export const createRestaurant = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = (req as any).user?.role;
    if (userRole !== 'admin') {
      res.status(403).json({ message: 'No tienes permisos' });
      return;
    }

    const { nombre, direccion } = req.body;

    const result = await pool.query(
      'INSERT INTO restaurantes (nombre, direccion) VALUES ($1, $2) RETURNING *',
      [nombre, direccion]
    );

    res.status(201).json({
      message: 'Restaurante creado',
      restaurant: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/**
 * @swagger
 * /restaurants:
 *   get:
 *     summary: Get all restaurants
 *     tags: [Restaurants]
 *     responses:
 *       200:
 *         description: List of all restaurants
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 restaurants:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Restaurant'
 *       500:
 *         description: Server error
 */
export const getAllRestaurants = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM restaurantes');
    res.status(200).json({ restaurants: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/**
 * @swagger
 * /restaurants/{id}:
 *   get:
 *     summary: Get a restaurant by ID
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Restaurant ID
 *     responses:
 *       200:
 *         description: Restaurant details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 restaurant:
 *                   $ref: '#/components/schemas/Restaurant'
 *       404:
 *         description: Restaurant not found
 *       500:
 *         description: Server error
 */
export const getRestaurantById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM restaurantes WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Restaurante no encontrado' });
      return;
    }

    res.status(200).json({ restaurant: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/**
 * @swagger
 * /restaurants/{id}:
 *   put:
 *     summary: Update a restaurant (admin only)
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Restaurant ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               direccion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Restaurant updated successfully
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Restaurant not found
 *       500:
 *         description: Server error
 */
export const updateRestaurant = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = (req as any).user?.role;
    if (userRole !== 'admin') {
      res.status(403).json({ message: 'No tienes permisos' });
      return;
    }

    const { id } = req.params;
    const { nombre, direccion } = req.body;

    const result = await pool.query(
      'UPDATE restaurantes SET nombre = $1, direccion = $2 WHERE id = $3 RETURNING *',
      [nombre, direccion, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Restaurante no encontrado' });
      return;
    }

    res.status(200).json({
      message: 'Restaurante actualizado',
      restaurant: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/**
 * @swagger
 * /restaurants/{id}:
 *   delete:
 *     summary: Delete a restaurant (admin only)
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Restaurant ID
 *     responses:
 *       200:
 *         description: Restaurant deleted successfully
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Restaurant not found
 *       500:
 *         description: Server error
 */
export const deleteRestaurant = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = (req as any).user?.role;
    if (userRole !== 'admin') {
      res.status(403).json({ message: 'No tienes permisos' });
      return;
    }

    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM restaurantes WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Restaurante no encontrado' });
      return;
    }

    res.status(200).json({ message: 'Restaurante eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
