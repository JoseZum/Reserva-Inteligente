// servidor principal
// src/index.ts
import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './auth/auth.routes';
import usersRoutes from './users/users.routes'; // <---

dotenv.config();
const app = express();

app.use(express.json());

app.use('/auth', authRoutes);

app.use('/users', usersRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
