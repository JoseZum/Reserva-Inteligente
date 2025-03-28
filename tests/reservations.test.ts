import request from 'supertest';
import app from '../src/index';
import { pool } from '../src/config/db';

afterAll(async () => {
  await pool.end();
});

describe('Reservations Endpoints', () => {
  let userToken: string;
  let reservationId: number;
  let restaurantId: number;
  const userEmail = `user_res_${Date.now()}@example.com`;

  beforeAll(async () => {
    // Crear y loguear un usuario normal
    await request(app).post('/auth/register').send({
      email: userEmail,
      password: 'res123',
      role: 'cliente',
    });
    const res = await request(app).post('/auth/login').send({
      email: userEmail,
      password: 'res123',
    });
    userToken = res.body.token;

    // Crear un restaurante para la reserva (usando un admin)
    const adminEmail = `admin_res_${Date.now()}@example.com`;
    await request(app).post('/auth/register').send({
      email: adminEmail,
      password: 'admin123',
      role: 'admin',
    });
    const adminRes = await request(app).post('/auth/login').send({
      email: adminEmail,
      password: 'admin123',
    });
    const adminToken = adminRes.body.token;
    const restRes = await request(app)
      .post('/restaurants')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nombre: 'Restaurante Reserva', direccion: 'Calle Reserva 100' });
    restaurantId = restRes.body.restaurant.id;
  });

  it('Debe crear una reserva (POST /reservations)', async () => {
    const res = await request(app)
      .post('/reservations')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        fecha: '2025-12-31',
        hora: '20:00:00',
        restaurante_id: restaurantId,
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.reservation).toHaveProperty('id');
    reservationId = res.body.reservation.id;
  });

  it('Debe cancelar una reserva (DELETE /reservations/:id)', async () => {
    const res = await request(app)
      .delete(`/reservations/${reservationId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Reserva cancelada');
  });
});
