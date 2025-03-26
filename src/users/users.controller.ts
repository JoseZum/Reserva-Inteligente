import { Request, Response } from 'express';
import { pool } from '../config/db';

/**
 * @desc Obtener datos del usuario autenticado
 * @route GET /users/me
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
  
      const result = await pool.query(
        'SELECT id, email, role FROM usuarios WHERE id = $1',
        [userId]
      );
  
      if (result.rows.length === 0) {
        res.status(404).json({ message: 'Usuario no encontrado' });
        return;
      }
  
      res.status(200).json({ user: result.rows[0] });
      // ¡No pongas return!
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error del servidor' });
    }
  };
  

/**
 * @desc Actualizar datos de un usuario
 * @route PUT /users/:id
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { email, role } = req.body;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
  
    try {
      if (userRole !== 'admin' && Number(userId) !== Number(id)) {
        res.status(403).json({ message: 'No tienes permisos' });
        return;
      }
  
      const result = await pool.query(
        'UPDATE usuarios SET email = $1, role = $2 WHERE id = $3 RETURNING id, email, role',
        [email, role, id]
      );
  
      if (result.rows.length === 0) {
        res.status(404).json({ message: 'Usuario no encontrado' });
        return;
      }
  
      res.status(200).json({ user: result.rows[0] });
    } catch (err) {
      res.status(500).json({ message: 'Error del servidor' });
    }
  };
  

/**
 * @desc Eliminar un usuario
 * @route DELETE /users/:id
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
  
    try {
      if (userRole !== 'admin' && Number(userId) !== Number(id)) {
        res.status(403).json({ message: 'No tienes permisos' });
        return;
      }
  
      const result = await pool.query(
        'DELETE FROM usuarios WHERE id = $1 RETURNING id',
        [id]
      );
  
      if (result.rows.length === 0) {
        res.status(404).json({ message: 'Usuario no encontrado' });
        return;
      }
  
      res.status(200).json({ message: 'Usuario eliminado' });
    } catch (err) {
      res.status(500).json({ message: 'Error del servidor' });
    }
  };
  