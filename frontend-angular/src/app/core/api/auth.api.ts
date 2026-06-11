import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../http/api-base-url.token';
import type { ApiResponse, LoginRequest, RegisterRequest, User } from './api.types';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  login(data: LoginRequest) {
    return this.http.post<ApiResponse<{ user: User; accessToken: string }>>(
      `${this.baseUrl}/auth/login`,
      data
    );
  }

  register(data: RegisterRequest) {
    return this.http.post<ApiResponse<{ user: User; accessToken: string }>>(
      `${this.baseUrl}/auth/register`,
      data
    );
  }

  logout() {
    return this.http.post<ApiResponse<{ message: string }>>(
      `${this.baseUrl}/auth/logout`,
      {}
    );
  }

  refresh() {
    return this.http.post<ApiResponse<{ accessToken: string; user: User }>>(
      `${this.baseUrl}/auth/refresh`,
      {}
    );
  }

  confirmEmail(token: string) {
    return this.http.get<ApiResponse<{ message: string }>>(
      `${this.baseUrl}/auth/confirm-email`,
      { params: { token } }
    );
  }
}
