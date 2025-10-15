import apiClient from './client';
import type { User, ApiResponse, UpdateProfileRequest } from '../types';

export const profileApi = {
  /**
   * Get current user profile
   */
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>('/profile/me');
    return response.data;
  },

  /**
   * Update current user profile
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<User>> => {
    const response = await apiClient.put<ApiResponse<User>>('/profile/me', data);
    return response.data;
  },

  /**
   * Upload avatar
   */
  uploadAvatar: async (file: File): Promise<ApiResponse<{ avatarUrl: string }>> => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.post<ApiResponse<{ avatarUrl: string }>>(
      '/profile/me/avatar',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Change password
   */
  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      '/profile/me/password',
      data
    );
    return response.data;
  },
};
