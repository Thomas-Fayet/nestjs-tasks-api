import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { createTestApp } from './setup-app';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  const userPayload = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'Password1!',
  };

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await dataSource.query('TRUNCATE TABLE "user" RESTART IDENTITY CASCADE');
  });

  describe('POST /users', () => {
    it('creates a user and returns 201 without password', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send(userPayload)
        .expect(201)
        .expect(({ body }) => {
          expect(body.email).toBe('john@example.com');
          expect(body).not.toHaveProperty('password');
        });
    });

    it('returns 409 when email already exists', async () => {
      await request(app.getHttpServer()).post('/users').send(userPayload);

      return request(app.getHttpServer())
        .post('/users')
        .send(userPayload)
        .expect(409);
    });

    it('returns 400 when required fields are missing', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({ email: 'john@example.com' })
        .expect(400);
    });

    it('returns 400 when password is too weak', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({ ...userPayload, password: 'weak' })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await request(app.getHttpServer()).post('/users').send(userPayload);
    });

    it('returns access_token and refresh_token with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: userPayload.email, password: userPayload.password })
        .expect(201)
        .expect(({ body }) => {
          expect(body).toHaveProperty('access_token');
          expect(body).toHaveProperty('refresh_token');
        });
    });

    it('returns 401 when user does not exist', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'unknown@example.com', password: 'Password1!' })
        .expect(401);
    });

    it('returns 401 when password is wrong', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: userPayload.email, password: 'WrongPass1!' })
        .expect(401);
    });

    it('returns 400 when fields are missing', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(400);
    });
  });

  describe('POST /auth/refresh', () => {
    it('returns a new access_token with a valid refresh_token', async () => {
      await request(app.getHttpServer()).post('/users').send(userPayload);
      const { body } = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: userPayload.email, password: userPayload.password });

      return request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${body.refresh_token}`)
        .expect(201)
        .expect(({ body: refreshBody }) => {
          expect(refreshBody).toHaveProperty('access_token');
        });
    });

    it('returns 401 with an access_token instead of refresh_token', async () => {
      await request(app.getHttpServer()).post('/users').send(userPayload);
      const { body } = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: userPayload.email, password: userPayload.password });

      return request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${body.access_token}`)
        .expect(401);
    });
  });
});
