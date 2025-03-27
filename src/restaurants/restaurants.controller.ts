// src/restaurants/restaurants.controller.ts

import { Request, Response } from 'express';
import { pool } from '../config/db';

/**
 * @desc Crear un nuevo restaurante (solo admin)
 * @route POST /restaurants
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
 * @desc Listar todos los restaurantes (público)
 * @route GET /restaurants
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
 * @desc Obtener un restaurante por ID (público)
 * @route GET /restaurants/:id
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
 * @desc Actualizar un restaurante (solo admin)
 * @route PUT /restaurants/:id
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
 * @desc Eliminar un restaurante (solo admin)
 * @route DELETE /restaurants/:id
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
