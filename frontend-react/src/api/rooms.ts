import apiClient from './client';
import type { Room, ApiResponse, CreateRoomRequest, UpdateRoomRequest } from '../types';

export const roomsApi = {
  /**
   * Get all rooms
   */
  getRooms: async (): Promise<ApiResponse<Room[]>> => {
    const response = await apiClient.get<ApiResponse<Room[]>>('/rooms');
    return response.data;
  },

  /**
   * Create new room (Admin+ only)
   */
  createRoom: async (data: CreateRoomRequest): Promise<ApiResponse<Room>> => {
    const response = await apiClient.post<ApiResponse<Room>>('/rooms', data);
    return response.data;
  },

  /**
   * Update room (Admin+ only)
   */
  updateRoom: async (roomId: string, data: UpdateRoomRequest): Promise<ApiResponse<Room>> => {
    const response = await apiClient.put<ApiResponse<Room>>(`/rooms/${roomId}`, data);
    return response.data;
  },

  /**
   * Delete room (Admin+ only)
   */
  deleteRoom: async (roomId: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/rooms/${roomId}`);
    return response.data;
  },
};
