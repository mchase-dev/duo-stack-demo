/**
 * RealtimeAdapter Integration Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MockRealtimeAdapter } from '../../test/mocks/realtime';
import type { RoomMessageEvent, EventCreatedEvent } from '../RealtimeAdapter';

describe('MockRealtimeAdapter', () => {
  let adapter: MockRealtimeAdapter;

  beforeEach(() => {
    adapter = new MockRealtimeAdapter();
  });

  it('should connect and update status', async () => {
    expect(adapter.getStatus()).toBe('disconnected');

    await adapter.connect('test-token');

    expect(adapter.getStatus()).toBe('connected');
  });

  it('should disconnect and update status', async () => {
    await adapter.connect('test-token');
    expect(adapter.getStatus()).toBe('connected');

    adapter.disconnect();

    expect(adapter.getStatus()).toBe('disconnected');
  });

  it('should trigger room message callbacks', async () => {
    await adapter.connect('test-token');

    const mockMessage: RoomMessageEvent = {
      roomId: 'room-1',
      messageId: 'msg-1',
      senderId: 'user-1',
      senderUsername: 'testuser',
      message: 'Hello, room!',
      timestamp: new Date().toISOString(),
    };

    let receivedMessage: RoomMessageEvent | null = null;
    adapter.onRoomMessage((event) => {
      receivedMessage = event;
    });

    adapter.simulateRoomMessage(mockMessage);

    expect(receivedMessage).toEqual(mockMessage);
  });

  it('should trigger event created callbacks', async () => {
    await adapter.connect('test-token');

    const mockEvent: EventCreatedEvent = {
      eventId: 'event-1',
      title: 'Test Event',
      startTime: '2024-01-15T10:00:00.000Z',
      endTime: '2024-01-15T11:00:00.000Z',
      visibility: 'Public',
      createdBy: 'user-1',
    };

    let receivedEvent: EventCreatedEvent | null = null;
    adapter.onEventCreated((event) => {
      receivedEvent = event;
    });

    adapter.simulateEventCreated(mockEvent);

    expect(receivedEvent).toEqual(mockEvent);
  });

  it('should handle multiple callbacks for same event', async () => {
    await adapter.connect('test-token');

    const mockMessage: RoomMessageEvent = {
      roomId: 'room-1',
      messageId: 'msg-1',
      senderId: 'user-1',
      senderUsername: 'testuser',
      message: 'Hello',
      timestamp: new Date().toISOString(),
    };

    let count = 0;
    adapter.onRoomMessage(() => count++);
    adapter.onRoomMessage(() => count++);

    adapter.simulateRoomMessage(mockMessage);

    expect(count).toBe(2);
  });

  it('should remove all listeners', async () => {
    await adapter.connect('test-token');

    let called = false;
    adapter.onRoomMessage(() => {
      called = true;
    });

    adapter.removeAllListeners();

    adapter.simulateRoomMessage({
      roomId: 'room-1',
      messageId: 'msg-1',
      senderId: 'user-1',
      senderUsername: 'testuser',
      message: 'Hello',
      timestamp: new Date().toISOString(),
    });

    expect(called).toBe(false);
  });

  it('should notify status change callbacks', async () => {
    let currentStatus = 'disconnected';
    adapter.onStatusChange((status) => {
      currentStatus = status;
    });

    await adapter.connect('test-token');

    expect(currentStatus).toBe('connected');

    adapter.disconnect();

    expect(currentStatus).toBe('disconnected');
  });
});
