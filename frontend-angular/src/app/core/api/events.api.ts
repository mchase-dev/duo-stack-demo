import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_BASE_URL } from '../http/api-base-url.token';
import type {
  ApiResponse,
  CalendarEvent,
  CreateEventRequest,
  EventsQueryParams,
  UpdateEventRequest,
} from './api.types';

@Injectable({ providedIn: 'root' })
export class EventsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getEvents(params?: EventsQueryParams) {
    let httpParams = new HttpParams();
    if (params?.startTime) httpParams = httpParams.set('startTime', params.startTime);
    if (params?.endTime) httpParams = httpParams.set('endTime', params.endTime);
    if (params?.visibility) httpParams = httpParams.set('visibility', params.visibility);
    return this.http.get<ApiResponse<CalendarEvent[]>>(`${this.baseUrl}/events`, {
      params: httpParams,
    });
  }

  getEventById(eventId: string) {
    return this.http.get<ApiResponse<CalendarEvent>>(`${this.baseUrl}/events/${eventId}`);
  }

  createEvent(data: CreateEventRequest) {
    return this.http.post<ApiResponse<CalendarEvent>>(`${this.baseUrl}/events`, data);
  }

  updateEvent(eventId: string, data: UpdateEventRequest) {
    return this.http.put<ApiResponse<CalendarEvent>>(`${this.baseUrl}/events/${eventId}`, data);
  }

  deleteEvent(eventId: string) {
    return this.http.delete<ApiResponse<{ message: string }>>(
      `${this.baseUrl}/events/${eventId}`
    );
  }
}
