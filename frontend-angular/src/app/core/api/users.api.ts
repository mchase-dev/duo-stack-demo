import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_BASE_URL } from '../http/api-base-url.token';
import type { ApiResponse, PaginatedResponse, User, UserRole, UsersQueryParams } from './api.types';

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getUsers(query?: UsersQueryParams) {
    let params = new HttpParams();
    if (query?.page) params = params.set('page', query.page);
    if (query?.pageSize) params = params.set('pageSize', query.pageSize);
    if (query?.search) params = params.set('search', query.search);
    return this.http.get<PaginatedResponse<User>>(`${this.baseUrl}/users`, { params });
  }

  getUserById(userId: string) {
    return this.http.get<ApiResponse<User>>(`${this.baseUrl}/users/${userId}`);
  }

  updateUser(
    userId: string,
    data: { firstName?: string; lastName?: string; phoneNumber?: string; bio?: string }
  ) {
    return this.http.put<ApiResponse<User>>(`${this.baseUrl}/users/${userId}`, data);
  }

  deleteUser(userId: string) {
    return this.http.delete<ApiResponse<{ message: string }>>(
      `${this.baseUrl}/users/${userId}`
    );
  }

  updateUserRole(userId: string, role: UserRole) {
    return this.http.put<ApiResponse<User>>(`${this.baseUrl}/users/${userId}/role`, { role });
  }
}
