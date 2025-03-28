import request from 'supertest';
import app from '../src/index'; // Asegúrate de que tu app esté exportada correctamente (ver ejemplo en app.ts)
import { pool } from '../src/config/db';

afterAll(async () => {
  await pool.end();
});

describe('Auth Endpoints', () => {
  let token: string;
  const testEmail = `testauth_${Date.now()}@example.com`;

  it('Debe registrar un usuario nuevo', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        email: testEmail,
        password: 'test123',
        role: 'cliente',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('user');
  });

  it('Debe iniciar sesión y obtener un token', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: testEmail,
        password: 'test123',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  it('Debe obtener los detalles del usuario autenticado', async () => {
    const res = await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toEqual(testEmail);
  });
});
