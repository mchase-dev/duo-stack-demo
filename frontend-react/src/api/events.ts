import apiClient from './client';
import type { Event, ApiResponse, CreateEventRequest, UpdateEventRequest, EventsQueryParams } from '../types';

export const eventsApi = {
  /**
   * Get all events with optional filtering
   */
  getEvents: async (params?: EventsQueryParams): Promise<ApiResponse<Event[]>> => {
    const response = await apiClient.get<ApiResponse<Event[]>>('/events', { params });
    return response.data;
  },

  /**
   * Get event by ID
   */
  getEventById: async (eventId: string): Promise<ApiResponse<Event>> => {
    const response = await apiClient.get<ApiResponse<Event>>(`/events/${eventId}`);
    return response.data;
  },

  /**
   * Create new event
   */
  createEvent: async (data: CreateEventRequest): Promise<ApiResponse<Event>> => {
    const response = await apiClient.post<ApiResponse<Event>>('/events', data);
    return response.data;
  },

  /**
   * Update event
   */
  updateEvent: async (eventId: string, data: UpdateEventRequest): Promise<ApiResponse<Event>> => {
    const response = await apiClient.put<ApiResponse<Event>>(`/events/${eventId}`, data);
    return response.data;
  },

  /**
   * Delete event
   */
  deleteEvent: async (eventId: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/events/${eventId}`);
    return response.data;
  },
};
