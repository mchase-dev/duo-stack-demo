import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../http/api-base-url.token';
import type { ApiResponse, UpdateProfileRequest, User } from './api.types';

@Injectable({ providedIn: 'root' })
export class ProfileApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getProfile() {
    return this.http.get<ApiResponse<User>>(`${this.baseUrl}/profile/me`);
  }

  updateProfile(data: UpdateProfileRequest) {
    return this.http.put<ApiResponse<User>>(`${this.baseUrl}/profile/me`, data);
  }

  uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http.post<ApiResponse<{ avatarUrl: string }>>(
      `${this.baseUrl}/profile/me/avatar`,
      formData
    );
  }

  changePassword(data: { currentPassword: string; newPassword: string }) {
    return this.http.post<ApiResponse<{ message: string }>>(
      `${this.baseUrl}/profile/me/password`,
      data
    );
  }
}
