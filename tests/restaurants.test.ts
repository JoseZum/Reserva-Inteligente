import request from 'supertest';
import app from '../src/index';
import { pool } from '../src/config/db';

afterAll(async () => {
  await pool.end();
});

describe('Restaurants Endpoints', () => {
  let adminToken: string;
  let restaurantId: number;
  const adminEmail = `admin_rest_${Date.now()}@example.com`;

  beforeAll(async () => {
    // Crear y loguear un usuario admin
    await request(app).post('/auth/register').send({
      email: adminEmail,
      password: 'admin123',
      role: 'admin',
    });
    const res = await request(app).post('/auth/login').send({
      email: adminEmail,
      password: 'admin123',
    });
    adminToken = res.body.token;
  });

  it('Admin debe poder crear un restaurante (POST /restaurants)', async () => {
    const res = await request(app)
      .post('/restaurants')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombre: 'Restaurante Prueba',
        direccion: 'Calle Test 123',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.restaurant).toHaveProperty('id');
    restaurantId = res.body.restaurant.id;
  });

  it('Debe listar restaurantes (GET /restaurants) sin token', async () => {
    const res = await request(app).get('/restaurants');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.restaurants)).toBe(true);
  });

  it('Admin debe poder actualizar un restaurante (PUT /restaurants/:id)', async () => {
    const res = await request(app)
      .put(`/restaurants/${restaurantId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombre: 'Restaurante Actualizado',
        direccion: 'Nueva Dirección 999',
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.restaurant.nombre).toBe('Restaurante Actualizado');
  });

  it('Admin debe poder eliminar un restaurante (DELETE /restaurants/:id)', async () => {
    const res = await request(app)
      .delete(`/restaurants/${restaurantId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Restaurante eliminado');
  });
});
