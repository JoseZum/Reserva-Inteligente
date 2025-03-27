// tests/orders.test.ts
import request from 'supertest';
import app from '../src/index';
import { pool } from '../src/config/db';

afterAll(async () => {
  await pool.end();
});

describe('Orders Endpoints', () => {
  let userToken: string;
  let orderId: number;
  let menuId: number;
  const userEmail = `user_order_${Date.now()}@example.com`;

  beforeAll(async () => {
    // Crear y loguear un usuario normal
    await request(app).post('/auth/register').send({
      email: userEmail,
      password: 'order123',
      role: 'cliente',
    });
    const res = await request(app).post('/auth/login').send({
      email: userEmail,
      password: 'order123',
    });
    userToken = res.body.token;

    // Crear un menú para asociar el pedido (usando admin y un restaurante)
    const adminEmail = `admin_order_${Date.now()}@example.com`;
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
    // Crear un restaurante
    const restRes = await request(app)
      .post('/restaurants')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nombre: 'Restaurante Order', direccion: 'Calle Order 50' });
    const restaurantId = restRes.body.restaurant.id;
    // Crear un menú
    const menuRes = await request(app)
      .post(`/restaurants/${restaurantId}/menus`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        platillo: 'Ensalada Order',
        precio: 7.5,
      });
    menuId = menuRes.body.menu.id;
  });

  it('Debe crear un pedido (POST /orders)', async () => {
    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        menu_id: menuId,
        cantidad: 2,
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.order).toHaveProperty('id');
    orderId = res.body.order.id;
  });

  it('Debe obtener detalles de un pedido (GET /orders/:id)', async () => {
    const res = await request(app)
      .get(`/orders/${orderId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.order.id).toBe(orderId);
  });

  it('Debe actualizar un pedido (PUT /orders/:id)', async () => {
    const res = await request(app)
      .put(`/orders/${orderId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ menu_id: menuId, cantidad: 3 });
    expect(res.statusCode).toBe(200);
    expect(res.body.order.cantidad).toBe(3);
  });

  it('Debe eliminar un pedido (DELETE /orders/:id)', async () => {
    const res = await request(app)
      .delete(`/orders/${orderId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Pedido eliminado');
  });
});
