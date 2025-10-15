/**
 * RBAC Middleware Tests
 */

import request from 'supertest';
import { createApp } from '../../src/app';
import { createTestUser, createAdminUser, createSuperuser } from '../helpers';

const app = createApp();

describe('RBAC Middleware', () => {
  describe('Admin-only endpoints', () => {
    it('should allow Admin users to access admin routes', async () => {
      const admin = await createAdminUser();

      const response = await request(app)
        .get('/api/v1/rooms')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should allow Superuser to access admin routes', async () => {
      const superuser = await createSuperuser();

      const response = await request(app)
        .get('/api/v1/rooms')
        .set('Authorization', `Bearer ${superuser.accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should deny regular users access to admin routes', async () => {
      const user = await createTestUser();

      await request(app)
        .post('/api/v1/rooms')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send({
          name: 'Test Room',
          isPublic: true,
        })
        .expect(403);
    });
  });

  describe('Superuser-only endpoints', () => {
    it('should allow Superuser to access superuser routes', async () => {
      const superuser = await createSuperuser();

      const response = await request(app)
        .post('/api/v1/pages')
        .set('Authorization', `Bearer ${superuser.accessToken}`)
        .send({
          title: 'Test Page',
          slug: 'test-page',
          content: 'Test content',
          isPublished: false,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should deny Admin users access to superuser routes', async () => {
      const admin = await createAdminUser();

      await request(app)
        .post('/api/v1/pages')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({
          title: 'Test Page',
          slug: 'test-page-admin',
          content: 'Test content',
          isPublished: false,
        })
        .expect(403);
    });

    it('should deny regular users access to superuser routes', async () => {
      const user = await createTestUser();

      await request(app)
        .post('/api/v1/pages')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send({
          title: 'Test Page',
          slug: 'test-page-user',
          content: 'Test content',
          isPublished: false,
        })
        .expect(403);
    });
  });

  describe('Protected endpoints (authenticated users)', () => {
    it('should allow authenticated users to access protected routes', async () => {
      const user = await createTestUser();

      const response = await request(app)
        .get('/api/v1/profile/me')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should deny unauthenticated users', async () => {
      await request(app).get('/api/v1/profile/me').expect(401);
    });

    it('should deny users with invalid token', async () => {
      await request(app)
        .get('/api/v1/profile/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
