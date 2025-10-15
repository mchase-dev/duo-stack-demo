/**
 * API Mocks
 * Mock implementations for API calls
 */

import type { AuthResponse, User, UserRole } from '../../types';

export const mockUser: User = {
  id: 'test-user-id',
  email: 'test@example.com',
  username: 'testuser',
  role: 'User' as UserRole,
  firstName: 'Test',
  lastName: 'User',
  phoneNumber: null,
  bio: null,
  avatarUrl: null,
  emailConfirmed: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

export const mockAuthResponse: AuthResponse = {
  success: true,
  data: {
    user: mockUser,
    accessToken: 'mock-access-token',
  },
};

export const mockAdminUser: User = {
  ...mockUser,
  id: 'admin-user-id',
  email: 'admin@example.com',
  username: 'admin',
  role: 'Admin' as UserRole,
};

export const mockSuperuser: User = {
  ...mockUser,
  id: 'superuser-id',
  email: 'superuser@example.com',
  username: 'superuser',
  role: 'Superuser' as UserRole,
};
