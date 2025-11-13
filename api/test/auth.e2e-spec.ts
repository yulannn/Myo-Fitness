import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let refreshCookie: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/v1/auth/register (POST) - should register a new user', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      })
      .expect(201);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('user');
    refreshCookie = res.headers['set-cookie'][0];
  });

  it('/api/v1/auth/login (POST) - should login user', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
      })
      .expect(201);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('user');
    accessToken = res.body.accessToken;
    refreshCookie = res.headers['set-cookie'][0];
  });

  it('/api/v1/auth/me (GET) - should return user info', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.user.email).toBe('test@example.com');
  });

  it('/api/v1/auth/refresh (POST) - should refresh token', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .set('Cookie', refreshCookie)
      .expect(200);

    expect(res.body).toHaveProperty('accessToken');
  });

  it('/api/v1/auth/logout (POST) - should logout user', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });
});
