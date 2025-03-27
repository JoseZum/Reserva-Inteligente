// tests/menus.test.ts
import request from 'supertest';
import app from '../src/index';
import { pool } from '../src/config/db';

afterAll(async () => {
  await pool.end();
});

describe('Menus Endpoints', () => {
  let adminToken: string;
  let restaurantId: number;
  let menuId: number;
  const adminEmail = `admin_menu_${Date.now()}@example.com`;

  beforeAll(async () => {
    // Crear y loguear un admin
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

    // Crear un restaurante para asociar menús
    const restRes = await request(app)
      .post('/restaurants')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nombre: 'Restaurante Menú', direccion: 'Calle Menu 45' });
    restaurantId = restRes.body.restaurant.id;
  });

  it('Debe crear un menú para un restaurante (POST /restaurants/:id/menus)', async () => {
    const res = await request(app)
      .post(`/restaurants/${restaurantId}/menus`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        platillo: 'Pizza de Prueba',
        precio: 9.99,
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.menu).toHaveProperty('id');
    menuId = res.body.menu.id;
  });

  it('Debe obtener detalles de un menú (GET /menus/:id)', async () => {
    const res = await request(app).get(`/menus/${menuId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.menu.platillo).toBe('Pizza de Prueba');
  });

  it('Admin debe poder actualizar un menú (PUT /menus/:id)', async () => {
    const res = await request(app)
      .put(`/menus/${menuId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        platillo: 'Pizza 4 Quesos',
        precio: 12.5,
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.menu.platillo).toBe('Pizza 4 Quesos');
  });

  it('Admin debe poder eliminar un menú (DELETE /menus/:id)', async () => {
    const res = await request(app)
      .delete(`/menus/${menuId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Menú eliminado');
  });
});
