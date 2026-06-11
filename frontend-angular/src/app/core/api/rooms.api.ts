import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../http/api-base-url.token';
import type { ApiResponse, CreateRoomRequest, Room, UpdateRoomRequest } from './api.types';

@Injectable({ providedIn: 'root' })
export class RoomsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getRooms() {
    return this.http.get<ApiResponse<Room[]>>(`${this.baseUrl}/rooms`);
  }

  createRoom(data: CreateRoomRequest) {
    return this.http.post<ApiResponse<Room>>(`${this.baseUrl}/rooms`, data);
  }

  updateRoom(roomId: string, data: UpdateRoomRequest) {
    return this.http.put<ApiResponse<Room>>(`${this.baseUrl}/rooms/${roomId}`, data);
  }

  deleteRoom(roomId: string) {
    return this.http.delete<ApiResponse<{ message: string }>>(
      `${this.baseUrl}/rooms/${roomId}`
    );
  }
}
