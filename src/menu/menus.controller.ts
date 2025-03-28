import { Request, Response } from 'express';
import { pool } from '../config/db';

/**
 * @swagger
 * components:
 *   schemas:
 *     Menu:
 *       type: object
 *       required:
 *         - platillo
 *         - precio
 *         - restaurante_id
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the menu item
 *         platillo:
 *           type: string
 *           description: The name of the dish
 *         precio:
 *           type: number
 *           format: float
 *           description: The price of the dish
 *         restaurante_id:
 *           type: integer
 *           description: The ID of the restaurant this menu belongs to
 */

/**
 * @swagger
 * /restaurants/{id}/menus:
 *   post:
 *     summary: Create a menu item for a restaurant
 *     tags: [Menus]
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
 *             required:
 *               - platillo
 *               - precio
 *             properties:
 *               platillo:
 *                 type: string
 *               precio:
 *                 type: number
 *                 format: float
 *     responses:
 *       201:
 *         description: Menu item created successfully
 *       500:
 *         description: Server error
 */
export const createMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    // Obtenemos el ID del restaurante desde los parámetros (ruta anidada)
    const restaurantId = req.params.id;
    const { platillo, precio } = req.body;

    const result = await pool.query(
      'INSERT INTO menus (platillo, precio, restaurante_id) VALUES ($1, $2, $3) RETURNING *',
      [platillo, precio, restaurantId]
    );

    res.status(201).json({ message: 'Menú creado', menu: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/**
 * @swagger
 * /restaurants/{id}/menus:
 *   get:
 *     summary: Get all menu items for a restaurant
 *     tags: [Menus]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Restaurant ID
 *     responses:
 *       200:
 *         description: List of menu items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 menus:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Menu'
 *       500:
 *         description: Server error
 */
export const getMenusByRestaurant = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurantId = req.params.id;
    const result = await pool.query('SELECT * FROM menus WHERE restaurante_id = $1', [restaurantId]);
    res.status(200).json({ menus: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/**
 * @swagger
 * /menus/{id}:
 *   get:
 *     summary: Get a menu item by ID
 *     tags: [Menus]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Menu ID
 *     responses:
 *       200:
 *         description: Menu item details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 menu:
 *                   $ref: '#/components/schemas/Menu'
 *       404:
 *         description: Menu item not found
 *       500:
 *         description: Server error
 */
export const getMenuById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM menus WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Menú no encontrado' });
      return;
    }
    res.status(200).json({ menu: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/**
 * @swagger
 * /menus/{id}:
 *   put:
 *     summary: Update a menu item (admin only)
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Menu ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               platillo:
 *                 type: string
 *               precio:
 *                 type: number
 *                 format: float
 *     responses:
 *       200:
 *         description: Menu item updated successfully
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Menu item not found
 *       500:
 *         description: Server error
 */
export const updateMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    // Solo admin puede actualizar
    const userRole = (req as any).user?.role;
    if (userRole !== 'admin') {
      res.status(403).json({ message: 'No tienes permisos' });
      return;
    }

    const { id } = req.params;
    const { platillo, precio } = req.body;
    const result = await pool.query(
      'UPDATE menus SET platillo = $1, precio = $2 WHERE id = $3 RETURNING *',
      [platillo, precio, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Menú no encontrado' });
      return;
    }

    res.status(200).json({ message: 'Menú actualizado', menu: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/**
 * @swagger
 * /menus/{id}:
 *   delete:
 *     summary: Delete a menu item (admin only)
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Menu ID
 *     responses:
 *       200:
 *         description: Menu item deleted successfully
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Menu item not found
 *       500:
 *         description: Server error
 */
export const deleteMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    // Solo admin puede eliminar
    const userRole = (req as any).user?.role;
    if (userRole !== 'admin') {
      res.status(403).json({ message: 'No tienes permisos' });
      return;
    }

    const { id } = req.params;
    const result = await pool.query('DELETE FROM menus WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Menú no encontrado' });
      return;
    }

    res.status(200).json({ message: 'Menú eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
