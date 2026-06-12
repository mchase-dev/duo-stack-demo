import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { EventsStore } from './events.store';
import { EventsApiService } from '../../core/api/events.api';
import type { CalendarEvent } from '../../core/api/api.types';

const mockEvent: CalendarEvent = {
  id: 'evt-1',
  title: 'Test Event',
  description: 'desc',
  startTime: '2026-06-15T10:00:00.000Z',
  endTime: '2026-06-15T11:00:00.000Z',
  visibility: 'Public',
  color: '#3B82F6',
  location: null,
  createdBy: 'user-1',
  creatorUsername: 'testuser',
  allowedUserIds: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('EventsStore', () => {
  let store: EventsStore;
  let mockApi: { getEvents: ReturnType<typeof vi.fn>; createEvent: ReturnType<typeof vi.fn>; updateEvent: ReturnType<typeof vi.fn>; deleteEvent: ReturnType<typeof vi.fn> };
  let mockSnackBar: { open: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();
    mockApi = {
      getEvents: vi.fn().mockReturnValue(of({ success: true, data: [mockEvent] })),
      createEvent: vi.fn().mockReturnValue(of({ success: true, data: mockEvent })),
      updateEvent: vi.fn().mockReturnValue(of({ success: true, data: mockEvent })),
      deleteEvent: vi.fn().mockReturnValue(of({ success: true, data: { message: 'Deleted' } })),
    };
    mockSnackBar = { open: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        EventsStore,
        { provide: EventsApiService, useValue: mockApi },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    });

    store = TestBed.inject(EventsStore);
  });

  it('loadEvents fetches and updates events signal', async () => {
    expect(store.isLoading()).toBe(false);
    const promise = store.loadEvents();
    expect(store.isLoading()).toBe(true);
    await promise;
    expect(store.isLoading()).toBe(false);
    expect(store.events()).toEqual([mockEvent]);
    expect(mockApi.getEvents).toHaveBeenCalledOnce();
  });

  it('loadEvents with params passes them to the API', async () => {
    const params = { startTime: '2026-06-01T00:00:00Z', endTime: '2026-06-30T00:00:00Z' };
    await store.loadEvents(params);
    expect(mockApi.getEvents).toHaveBeenCalledWith(params);
  });

  it('loadEvents shows snackbar on error', async () => {
    mockApi.getEvents.mockReturnValue(throwError(() => new Error('Network error')));
    await store.loadEvents();
    expect(mockSnackBar.open).toHaveBeenCalledWith('Failed to load events', 'Dismiss', expect.any(Object));
    expect(store.events()).toEqual([]);
  });

  it('createEvent calls API and reloads', async () => {
    await store.createEvent({ title: 'New', startTime: '2026-06-15T10:00:00Z', endTime: '2026-06-15T11:00:00Z', visibility: 'Public' });
    expect(mockApi.createEvent).toHaveBeenCalledOnce();
    expect(mockApi.getEvents).toHaveBeenCalledOnce(); // reload
    expect(mockSnackBar.open).toHaveBeenCalledWith('Event created', undefined, expect.any(Object));
  });

  it('createEvent returns null and shows error on failure', async () => {
    mockApi.createEvent.mockReturnValue(throwError(() => new Error('Server error')));
    const result = await store.createEvent({ title: 'X', startTime: '', endTime: '', visibility: 'Public' });
    expect(result).toBeNull();
    expect(mockSnackBar.open).toHaveBeenCalledWith('Failed to create event', 'Dismiss', expect.any(Object));
  });

  it('updateEvent calls API and reloads', async () => {
    await store.updateEvent('evt-1', { title: 'Updated' });
    expect(mockApi.updateEvent).toHaveBeenCalledWith('evt-1', { title: 'Updated' });
    expect(mockApi.getEvents).toHaveBeenCalledOnce();
    expect(mockSnackBar.open).toHaveBeenCalledWith('Event updated', undefined, expect.any(Object));
  });

  it('deleteEvent calls API and reloads', async () => {
    const ok = await store.deleteEvent('evt-1');
    expect(ok).toBe(true);
    expect(mockApi.deleteEvent).toHaveBeenCalledWith('evt-1');
    expect(mockApi.getEvents).toHaveBeenCalledOnce();
    expect(mockSnackBar.open).toHaveBeenCalledWith('Event deleted', undefined, expect.any(Object));
  });

  it('deleteEvent returns false on failure', async () => {
    mockApi.deleteEvent.mockReturnValue(throwError(() => new Error('Server error')));
    const ok = await store.deleteEvent('evt-1');
    expect(ok).toBe(false);
  });

  it('wireRealtime subscribes and reloads on events', async () => {
    // Seed initial data
    await store.loadEvents();
    mockApi.getEvents.mockClear();

    const callbacks: Record<string, () => void> = {};
    const mockAdapter = {
      onEventCreated: vi.fn((cb: () => void) => { callbacks['created'] = cb; }),
      onEventUpdated: vi.fn((cb: () => void) => { callbacks['updated'] = cb; }),
      onEventDeleted: vi.fn((cb: () => void) => { callbacks['deleted'] = cb; }),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    store.wireRealtime(mockAdapter as any);
    expect(mockAdapter.onEventCreated).toHaveBeenCalledOnce();
    expect(mockAdapter.onEventUpdated).toHaveBeenCalledOnce();
    expect(mockAdapter.onEventDeleted).toHaveBeenCalledOnce();

    // Simulate realtime events
    callbacks['created']();
    await Promise.resolve();
    expect(mockApi.getEvents).toHaveBeenCalledTimes(1);

    callbacks['updated']();
    await Promise.resolve();
    expect(mockApi.getEvents).toHaveBeenCalledTimes(2);

    callbacks['deleted']();
    await Promise.resolve();
    expect(mockApi.getEvents).toHaveBeenCalledTimes(3);
  });

  it('wireRealtime is idempotent (repeated calendar visits do not stack listeners)', () => {
    const mockAdapter = {
      onEventCreated: vi.fn(),
      onEventUpdated: vi.fn(),
      onEventDeleted: vi.fn(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    store.wireRealtime(mockAdapter as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    store.wireRealtime(mockAdapter as any);

    expect(mockAdapter.onEventCreated).toHaveBeenCalledOnce();
    expect(mockAdapter.onEventUpdated).toHaveBeenCalledOnce();
    expect(mockAdapter.onEventDeleted).toHaveBeenCalledOnce();
  });

  it('hasLoaded becomes true after the first load and stays true across reloads', async () => {
    expect(store.hasLoaded()).toBe(false);
    await store.loadEvents();
    expect(store.hasLoaded()).toBe(true);

    // Subsequent reloads toggle isLoading but never reset hasLoaded
    const reload = store.loadEvents();
    expect(store.isLoading()).toBe(true);
    expect(store.hasLoaded()).toBe(true);
    await reload;
    expect(store.hasLoaded()).toBe(true);
  });
});
