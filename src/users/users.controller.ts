import { Request, Response } from 'express';
import { pool } from '../config/db';

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the user
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email
 *         role:
 *           type: string
 *           enum: [cliente, admin]
 *           description: The user's role
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    
    const result = await pool.query('SELECT id, email, role FROM usuarios WHERE id = $1', [userId]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    
    res.status(200).json({ user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *                 enum: [cliente, admin]
 *     responses:
 *       200:
 *         description: User updated successfully
 *       403:
 *         description: Forbidden - No permission
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    
    // Solo el propio usuario o un admin puede actualizar
    if (userRole !== 'admin' && Number(id) !== userId) {
      res.status(403).json({ message: 'No tienes permisos para actualizar este usuario' });
      return;
    }
    
    // Si no es admin, no puede cambiar el rol
    let updatedRole = role;
    if (userRole !== 'admin') {
      // Obtener el rol actual del usuario
      const currentUser = await pool.query('SELECT role FROM usuarios WHERE id = $1', [id]);
      if (currentUser.rows.length === 0) {
        res.status(404).json({ message: 'Usuario no encontrado' });
        return;
      }
      updatedRole = currentUser.rows[0].role;
    }
    
    const result = await pool.query(
      'UPDATE usuarios SET email = $1, role = $2 WHERE id = $3 RETURNING id, email, role',
      [email, updatedRole, id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    
    res.status(200).json({ user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       403:
 *         description: Forbidden - No permission
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    
    // Solo el propio usuario o un admin puede eliminar
    if (userRole !== 'admin' && Number(id) !== userId) {
      res.status(403).json({ message: 'No tienes permisos para eliminar este usuario' });
      return;
    }
    
    const result = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    
    res.status(200).json({ message: 'Usuario eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
  