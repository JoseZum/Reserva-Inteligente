// src/menus/menus.nested.routes.ts

import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { createMenu, getMenusByRestaurant } from './menus.controller';

// mergeParams: true para acceder al parámetro :id del restaurante en la ruta padre
const router = Router({ mergeParams: true });

// POST /restaurants/:id/menus (protegido, solo admin)
router.post('/', authMiddleware, createMenu);
// GET /restaurants/:id/menus (público)
router.get('/', getMenusByRestaurant);

export default router;
