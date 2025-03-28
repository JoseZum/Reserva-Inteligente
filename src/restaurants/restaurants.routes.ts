import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant
} from './restaurants.controller';

import menuNestedRoutes from '../menu/menus.nested.routes';

const router = Router();

// Rutas públicas
router.get('/', getAllRestaurants);
router.get('/:id', getRestaurantById);



// Rutas protegidas (solo admin)
router.post('/', authMiddleware, createRestaurant);
router.put('/:id', authMiddleware, updateRestaurant);
router.delete('/:id', authMiddleware, deleteRestaurant);

router.use('/:id/menus', menuNestedRoutes);

export default router;
