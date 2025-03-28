import request from 'supertest';
import app from '../src/index';
import { pool } from '../src/config/db';

afterAll(async () => {
  await pool.end();
});

describe('Users Endpoints', () => {
  let adminToken: string;
  let normalToken: string;
  let createdUserId: number;
  const adminEmail = `admin_${Date.now()}@example.com`;
  const userEmail = `user_${Date.now()}@example.com`;

  beforeAll(async () => {
    // Crear y loguear un usuario admin
    await request(app).post('/auth/register').send({
      email: adminEmail,
      password: 'admin123',
      role: 'admin',
    });
    const adminRes = await request(app).post('/auth/login').send({
      email: adminEmail,
      password: 'admin123',
    });
    adminToken = adminRes.body.token;

    // Crear y loguear un usuario normal
    await request(app).post('/auth/register').send({
      email: userEmail,
      password: 'user123',
      role: 'cliente',
    });
    const userRes = await request(app).post('/auth/login').send({
      email: userEmail,
      password: 'user123',
    });
    normalToken = userRes.body.token;
  });

  it('Admin debe poder actualizar un usuario (PUT /users/:id)', async () => {
    // Crear un usuario para actualizar
    const createRes = await request(app).post('/auth/register').send({
      email: `update_${Date.now()}@example.com`,
      password: 'test123',
      role: 'cliente',
    });
    const newUser = createRes.body.user;
    createdUserId = newUser.id;

    // Actualización como admin
    const updateRes = await request(app)
      .put(`/users/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'updated_user@example.com', role: 'admin' });

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.user.email).toBe('updated_user@example.com');
    expect(updateRes.body.user.role).toBe('admin');
  });

  it('Usuario normal NO debe poder actualizar a otro usuario', async () => {
    const updateRes = await request(app)
      .put(`/users/${createdUserId}`)
      .set('Authorization', `Bearer ${normalToken}`)
      .send({ email: 'hack@example.com' });
    expect(updateRes.statusCode).toBe(403);
  });

  it('Usuario debe poder actualizar SU PROPIO perfil', async () => {
    const userInfo = await request(app).get('/users/me').set('Authorization', `Bearer ${normalToken}`);
    const myUserId = userInfo.body.user.id;

    const updateRes = await request(app)
      .put(`/users/${myUserId}`)
      .set('Authorization', `Bearer ${normalToken}`)
      .send({ email: 'mynewemail@example.com', role: 'cliente' });
    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.user.email).toBe('mynewemail@example.com');
  });

  it('Admin debe poder eliminar un usuario (DELETE /users/:id)', async () => {
    const deleteRes = await request(app)
      .delete(`/users/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body).toHaveProperty('message', 'Usuario eliminado');
  });
});
