import apiClient, { setAccessToken } from './client';
import type { AuthResponse, RegisterRequest, LoginRequest, User, ApiResponse } from '../types';

export const authApi = {
  /**
   * Register a new user
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    setAccessToken(response.data.data.accessToken);
    return response.data;
  },

  /**
   * Login user
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    setAccessToken(response.data.data.accessToken);
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async (): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/logout');
    setAccessToken(null);
    return response.data;
  },

  /**
   * Refresh access token
   */
  refresh: async (): Promise<ApiResponse<{ accessToken: string; user: User }>> => {
    const response = await apiClient.post<ApiResponse<{ accessToken: string; user: User }>>(
      '/auth/refresh'
    );
    setAccessToken(response.data.data.accessToken);
    return response.data;
  },

  /**
   * Confirm email (not implemented in backend yet)
   */
  confirmEmail: async (token: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.get<ApiResponse<{ message: string }>>(
      `/auth/confirm-email?token=${token}`
    );
    return response.data;
  },
};
