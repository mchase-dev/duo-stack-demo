/**
 * Events API Tests
 */

import request from 'supertest';
import { createApp } from '../../src/app';
import { Event, EventVisibility } from '../../src/models';
import { createTestUser } from '../helpers';

const app = createApp();

describe('Events API', () => {
  let user1: Awaited<ReturnType<typeof createTestUser>>;
  let user2: Awaited<ReturnType<typeof createTestUser>>;

  beforeEach(async () => {
    user1 = await createTestUser({ email: 'user1@example.com', username: 'user1' });
    user2 = await createTestUser({ email: 'user2@example.com', username: 'user2' });
  });

  describe('POST /api/v1/events', () => {
    it('should create a public event', async () => {
      const response = await request(app)
        .post('/api/v1/events')
        .set('Authorization', `Bearer ${user1.accessToken}`)
        .send({
          title: 'Public Event',
          description: 'A public event',
          startTime: new Date('2024-01-15T10:00:00.000Z'),
          endTime: new Date('2024-01-15T11:00:00.000Z'),
          visibility: EventVisibility.Public,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Public Event');
      expect(response.body.data.visibility).toBe('Public');
    });

    it('should create a private event', async () => {
      const response = await request(app)
        .post('/api/v1/events')
        .set('Authorization', `Bearer ${user1.accessToken}`)
        .send({
          title: 'Private Event',
          startTime: new Date('2024-01-15T10:00:00.000Z'),
          endTime: new Date('2024-01-15T11:00:00.000Z'),
          visibility: EventVisibility.Private,
        })
        .expect(201);

      expect(response.body.data.visibility).toBe('Private');
    });

    it('should create a restricted event with allowed users', async () => {
      const response = await request(app)
        .post('/api/v1/events')
        .set('Authorization', `Bearer ${user1.accessToken}`)
        .send({
          title: 'Restricted Event',
          startTime: new Date('2024-01-15T10:00:00.000Z'),
          endTime: new Date('2024-01-15T11:00:00.000Z'),
          visibility: EventVisibility.Restricted,
          allowedUserIds: [user2.id],
        })
        .expect(201);

      expect(response.body.data.visibility).toBe('Restricted');
      expect(response.body.data.allowedUserIds).toContain(user2.id);
    });
  });

  describe('GET /api/v1/events - Visibility filtering', () => {
    beforeEach(async () => {
      // Create public event
      await Event.create({
        title: 'Public Event',
        startTime: new Date('2024-01-15T10:00:00.000Z'),
        endTime: new Date('2024-01-15T11:00:00.000Z'),
        visibility: EventVisibility.Public,
        createdBy: user1.id,
      });

      // Create private event
      await Event.create({
        title: 'User1 Private Event',
        startTime: new Date('2024-01-15T12:00:00.000Z'),
        endTime: new Date('2024-01-15T13:00:00.000Z'),
        visibility: EventVisibility.Private,
        createdBy: user1.id,
      });

      // Create restricted event
      await Event.create({
        title: 'Restricted Event',
        startTime: new Date('2024-01-15T14:00:00.000Z'),
        endTime: new Date('2024-01-15T15:00:00.000Z'),
        visibility: EventVisibility.Restricted,
        createdBy: user1.id,
        allowedUserIds: [user2.id],
      });
    });

    it('should return public events to all users', async () => {
      const response = await request(app)
        .get('/api/v1/events')
        .set('Authorization', `Bearer ${user2.accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      const publicEvents = response.body.data.filter((e: any) => e.visibility === 'Public');
      expect(publicEvents.length).toBeGreaterThan(0);
    });

    it('should only show creator their own private events', async () => {
      const response = await request(app)
        .get('/api/v1/events')
        .set('Authorization', `Bearer ${user1.accessToken}`)
        .expect(200);

      const privateEvents = response.body.data.filter((e: any) => e.visibility === 'Private');
      expect(privateEvents.length).toBe(1);
      expect(privateEvents[0].createdBy).toBe(user1.id);
      expect(privateEvents[0].creatorUsername).toBe(user1.username);
    });

    it('should not show private events to other users', async () => {
      const response = await request(app)
        .get('/api/v1/events')
        .set('Authorization', `Bearer ${user2.accessToken}`)
        .expect(200);

      const privateEvents = response.body.data.filter(
        (e: any) => e.visibility === 'Private' && e.createdBy === user1.id
      );
      expect(privateEvents.length).toBe(0);
    });

    it('should show restricted events to allowed users', async () => {
      const response = await request(app)
        .get('/api/v1/events')
        .set('Authorization', `Bearer ${user2.accessToken}`)
        .expect(200);

      const restrictedEvents = response.body.data.filter((e: any) => e.visibility === 'Restricted');
      expect(restrictedEvents.length).toBeGreaterThan(0);
    });
  });

  describe('DELETE /api/v1/events/:id', () => {
    it('should allow creator to delete their event', async () => {
      const event = await Event.create({
        title: 'Test Event',
        startTime: new Date('2024-01-15T10:00:00.000Z'),
        endTime: new Date('2024-01-15T11:00:00.000Z'),
        visibility: EventVisibility.Public,
        createdBy: user1.id,
      });

      await request(app)
        .delete(`/api/v1/events/${event.id}`)
        .set('Authorization', `Bearer ${user1.accessToken}`)
        .expect(200);

      const deletedEvent = await Event.findByPk(event.id);
      expect(deletedEvent).toBeNull();
    });

    it('should not allow other users to delete event', async () => {
      const event = await Event.create({
        title: 'Test Event',
        startTime: new Date('2024-01-15T10:00:00.000Z'),
        endTime: new Date('2024-01-15T11:00:00.000Z'),
        visibility: EventVisibility.Public,
        createdBy: user1.id,
      });

      await request(app)
        .delete(`/api/v1/events/${event.id}`)
        .set('Authorization', `Bearer ${user2.accessToken}`)
        .expect(403);

      const stillExists = await Event.findByPk(event.id);
      expect(stillExists).toBeDefined();
    });
  });
});
