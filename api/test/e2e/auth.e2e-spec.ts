import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { PrismaService } from '../../prisma/prisma.service';
import { AppModule } from '../../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let refreshCookie: string;
  let prisma: PrismaService;
  const testEmail = `test-${Date.now()}@example.com`;
  const testEmailsToCleanup: string[] = [testEmail];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser.default());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    prisma = moduleFixture.get(PrismaService);
    await prisma.user.deleteMany({
      where: { email: { in: testEmailsToCleanup } },
    });
    await app.init();
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: { in: testEmailsToCleanup } },
          { email: { startsWith: 'test-' } },
          { email: { startsWith: 'rate-limit-' } },
        ],
      },
    });
    await app.close();
  });

  describe('Registration Flow', () => {
    it('/api/v1/auth/register (POST) - should register a new user', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          password: 'Password123!',
          name: 'Test User',
        })
        .expect(201);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(testEmail);
      expect(res.body.user.name).toBe('Test User');
      expect(res.body.user).not.toHaveProperty('password');
      expect(res.headers['set-cookie']).toBeDefined();
      refreshCookie = res.headers['set-cookie'][0];
    });

    it('/api/v1/auth/register (POST) - should fail with duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          password: 'Password123!',
          name: 'Another User',
        })
        .expect(401);
    });

    it('/api/v1/auth/register (POST) - should fail with invalid email', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Password123!',
          name: 'Test User',
        })
        .expect(400);
    });

    it('/api/v1/auth/register (POST) - should fail with weak password', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'another@example.com',
          password: '123',
          name: 'Test User',
        });

      expect([400, 429]).toContain(res.status);
    });
  });

  describe('Login Flow', () => {
    it('/api/v1/auth/login (POST) - should login user with valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: 'Password123!',
        })
        .expect(201);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(testEmail);
      expect(res.body.user).not.toHaveProperty('password');
      accessToken = res.body.accessToken;
      refreshCookie = res.headers['set-cookie'][0];
    });

    it('/api/v1/auth/login (POST) - should fail with invalid password', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: 'WrongPassword123!',
        })
        .expect(401);
    });

    it('/api/v1/auth/login (POST) - should fail with non-existent email', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        })
        .expect(401);
    });
  });

  describe('Protected Routes', () => {
    it('/api/v1/auth/me (GET) - should return user info with valid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.user.email).toBe(testEmail);
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('/api/v1/auth/me (GET) - should fail without token', async () => {
      await request(app.getHttpServer()).get('/api/v1/auth/me').expect(401);
    });

    it('/api/v1/auth/me (GET) - should fail with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('Token Refresh Flow', () => {
    it('/api/v1/auth/refresh (POST) - should refresh token with valid refresh token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', refreshCookie)
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('/api/v1/auth/refresh (POST) - should fail without refresh token', async () => {
      await request(app.getHttpServer()).post('/api/v1/auth/refresh').expect(401);
    });

    it('/api/v1/auth/refresh (POST) - should fail with invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', 'refreshToken=invalid-token')
        .expect(401);
    });
  });

  describe('Logout Flow', () => {
    it('/api/v1/auth/logout (POST) - should logout user successfully', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('message', 'Logged out successfully');
    });

    it('/api/v1/auth/logout (POST) - should fail without token', async () => {
      await request(app.getHttpServer()).post('/api/v1/auth/logout').expect(401);
    });

    it('/api/v1/auth/refresh (POST) - should fail after logout', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', refreshCookie)
        .expect(401);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on login endpoint', async () => {
      const testRateLimitEmail = `rate-limit-${Date.now()}@example.com`;
      let rateLimitHit = false;

      for (let i = 0; i < 5; i++) {
        const res = await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({
            email: testRateLimitEmail,
            password: 'wrong',
          });

        if (res.status === 429) {
          rateLimitHit = true;
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      expect(rateLimitHit).toBe(true);
    });
  });
});
