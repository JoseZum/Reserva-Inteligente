// src/menus/menus.controller.ts

import { Request, Response } from 'express';
import { pool } from '../config/db';

/**
 * Crear un menú para un restaurante.
 * Endpoint: POST /restaurants/:id/menus
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
 * Listar todos los menús de un restaurante.
 * Endpoint: GET /restaurants/:id/menus
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
 * Obtener detalles de un menú específico.
 * Endpoint: GET /menus/:id
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
 * Actualizar un menú (solo admin).
 * Endpoint: PUT /menus/:id
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
 * Eliminar un menú (solo admin).
 * Endpoint: DELETE /menus/:id
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
