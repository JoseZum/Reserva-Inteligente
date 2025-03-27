// src/index.ts
import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './auth/auth.routes';
import usersRoutes from './users/users.routes';
import restaurantRoutes from './restaurants/restaurants.routes';
import menuRoutes from './menu/menus.routes';
import reservationRoutes from './reservations/reservations.routes';
import orderRoutes from './orders/orders.routes';

dotenv.config();
const app = express();

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/restaurants', restaurantRoutes);
app.use('/menus', menuRoutes);
app.use('/reservations', reservationRoutes);
app.use('/orders', orderRoutes);

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
}


export default app;
