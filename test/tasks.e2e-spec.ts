import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { createTestApp } from './setup-app';

describe('Tasks (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let token: string;

  const userPayload = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'Password1!',
  };

  const taskPayload = { title: 'Test task', description: 'Test description' };

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = app.get(DataSource);

    await dataSource.query('TRUNCATE TABLE "task", "user" RESTART IDENTITY CASCADE');
    await request(app.getHttpServer()).post('/users').send(userPayload);
    const { body } = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: userPayload.email, password: userPayload.password });
    token = body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await dataSource.query('TRUNCATE TABLE "task" RESTART IDENTITY CASCADE');
  });

  describe('GET /tasks', () => {
    it('returns 401 without token', () => {
      return request(app.getHttpServer()).get('/tasks').expect(401);
    });

    it('returns only tasks of the authenticated user', async () => {
      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(taskPayload);

      return request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect(({ body }) => {
          expect(Array.isArray(body)).toBe(true);
          expect(body).toHaveLength(1);
          expect(body[0].title).toBe(taskPayload.title);
        });
    });
  });

  describe('POST /tasks', () => {
    it('returns 401 without token', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .send(taskPayload)
        .expect(401);
    });

    it('creates a task with pending status by default', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(taskPayload)
        .expect(201)
        .expect(({ body }) => {
          expect(body.title).toBe(taskPayload.title);
          expect(body.status).toBe('pending');
        });
    });

    it('returns 400 when description is missing', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test' })
        .expect(400);
    });

    it('returns 400 when status is invalid', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...taskPayload, status: 'invalid_status' })
        .expect(400);
    });
  });

  describe('GET /tasks/:id', () => {
    it('returns the task when it belongs to the user', async () => {
      const { body: task } = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(taskPayload);

      return request(app.getHttpServer())
        .get(`/tasks/${task.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect(({ body }) => {
          expect(body.id).toBe(task.id);
        });
    });

    it('returns 404 when task belongs to another user', async () => {
      const { body: task } = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(taskPayload);

      await request(app.getHttpServer())
        .post('/users')
        .send({ firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com', password: 'Password1!' });

      const { body } = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'jane@example.com', password: 'Password1!' });

      return request(app.getHttpServer())
        .get(`/tasks/${task.id}`)
        .set('Authorization', `Bearer ${body.access_token}`)
        .expect(404);
    });
  });

  describe('PATCH /tasks/:id', () => {
    it('updates and returns the task', async () => {
      const { body: task } = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(taskPayload);

      return request(app.getHttpServer())
        .patch(`/tasks/${task.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated title' })
        .expect(200)
        .expect(({ body }) => {
          expect(body.title).toBe('Updated title');
          expect(body.description).toBe(taskPayload.description);
        });
    });

    it('returns 404 when task belongs to another user', async () => {
      const { body: task } = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(taskPayload);

      await request(app.getHttpServer())
        .post('/users')
        .send({ firstName: 'Jane', lastName: 'Doe', email: 'jane2@example.com', password: 'Password1!' });

      const { body } = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'jane2@example.com', password: 'Password1!' });

      return request(app.getHttpServer())
        .patch(`/tasks/${task.id}`)
        .set('Authorization', `Bearer ${body.access_token}`)
        .send({ title: 'Hacked' })
        .expect(404);
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('deletes the task', async () => {
      const { body: task } = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(taskPayload);

      return request(app.getHttpServer())
        .delete(`/tasks/${task.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('returns 404 when task belongs to another user', async () => {
      const { body: task } = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(taskPayload);

      await request(app.getHttpServer())
        .post('/users')
        .send({ firstName: 'Jane', lastName: 'Doe', email: 'jane3@example.com', password: 'Password1!' });

      const { body } = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'jane3@example.com', password: 'Password1!' });

      return request(app.getHttpServer())
        .delete(`/tasks/${task.id}`)
        .set('Authorization', `Bearer ${body.access_token}`)
        .expect(404);
    });
  });
});
