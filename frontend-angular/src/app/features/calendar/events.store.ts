import { Injectable, inject, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { EventsApiService } from '../../core/api/events.api';
import type { RealtimeAdapter } from '../../core/realtime/realtime-adapter';
import type { CalendarEvent, CreateEventRequest, UpdateEventRequest, EventsQueryParams } from '../../core/api/api.types';

@Injectable({ providedIn: 'root' })
export class EventsStore {
  private readonly api = inject(EventsApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly events = signal<CalendarEvent[]>([]);
  readonly isLoading = signal(false);
  // True once the first load settles — gates the initial spinner only, so
  // refetches (CRUD, realtime) don't unmount the calendar and reset its view
  readonly hasLoaded = signal(false);

  private lastParams: EventsQueryParams | undefined;
  private realtimeWired = false;

  async loadEvents(params?: EventsQueryParams): Promise<void> {
    this.lastParams = params;
    this.isLoading.set(true);
    try {
      const res = await firstValueFrom(this.api.getEvents(params));
      this.events.set(res.data);
    } catch {
      this.snackBar.open('Failed to load events', 'Dismiss', { duration: 5000 });
    } finally {
      this.isLoading.set(false);
      this.hasLoaded.set(true);
    }
  }

  async createEvent(data: CreateEventRequest): Promise<CalendarEvent | null> {
    try {
      const res = await firstValueFrom(this.api.createEvent(data));
      this.snackBar.open('Event created', undefined, { duration: 3000 });
      await this.loadEvents(this.lastParams);
      return res.data;
    } catch {
      this.snackBar.open('Failed to create event', 'Dismiss', { duration: 5000 });
      return null;
    }
  }

  async updateEvent(id: string, data: UpdateEventRequest): Promise<CalendarEvent | null> {
    try {
      const res = await firstValueFrom(this.api.updateEvent(id, data));
      this.snackBar.open('Event updated', undefined, { duration: 3000 });
      await this.loadEvents(this.lastParams);
      return res.data;
    } catch {
      this.snackBar.open('Failed to update event', 'Dismiss', { duration: 5000 });
      return null;
    }
  }

  async deleteEvent(id: string): Promise<boolean> {
    try {
      await firstValueFrom(this.api.deleteEvent(id));
      this.snackBar.open('Event deleted', undefined, { duration: 3000 });
      await this.loadEvents(this.lastParams);
      return true;
    } catch {
      this.snackBar.open('Failed to delete event', 'Dismiss', { duration: 5000 });
      return false;
    }
  }

  // Idempotent — the store is a root singleton, so repeated calendar visits
  // must not stack duplicate listeners
  wireRealtime(adapter: RealtimeAdapter): void {
    if (this.realtimeWired) return;
    adapter.onEventCreated(() => this.loadEvents(this.lastParams));
    adapter.onEventUpdated(() => this.loadEvents(this.lastParams));
    adapter.onEventDeleted(() => this.loadEvents(this.lastParams));
    this.realtimeWired = true;
  }
}
