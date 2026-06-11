import apiClient from './client';
import type { User, ApiResponse, PaginatedResponse, UsersQueryParams } from '../types';

export const usersApi = {
  /**
   * Get all users (Admin+ only)
   */
  getUsers: async (params?: UsersQueryParams): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get<PaginatedResponse<User>>('/users', { params });
    return response.data;
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId: string): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${userId}`);
    return response.data;
  },

  /**
   * Update user (Admin+ only)
   */
  updateUser: async (
    userId: string,
    data: { firstName?: string; lastName?: string; phoneNumber?: string; bio?: string }
  ): Promise<ApiResponse<User>> => {
    const response = await apiClient.put<ApiResponse<User>>(`/users/${userId}`, data);
    return response.data;
  },

  /**
   * Delete user (Admin+ only)
   */
  deleteUser: async (userId: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/users/${userId}`);
    return response.data;
  },

  /**
   * Update user role (Superuser only)
   */
  updateUserRole: async (
    userId: string,
    role: 'User' | 'Admin' | 'Superuser'
  ): Promise<ApiResponse<User>> => {
    const response = await apiClient.put<ApiResponse<User>>(`/users/${userId}/role`, { role });
    return response.data;
  },
};
