/**
 * Test Helpers
 * Utility functions for creating test data
 */

import { User, UserRole } from '../src/models';
import { hashPassword } from '../src/utils/password';
import { generateAccessToken, generateRefreshToken } from '../src/utils/jwt';

export interface TestUser {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  accessToken: string;
  refreshToken: string;
}

export async function createTestUser(
  overrides?: Partial<{
    email: string;
    username: string;
    password: string;
    role: UserRole;
    emailConfirmed: boolean;
  }>
): Promise<TestUser> {
  const userData = {
    email: overrides?.email || 'test@example.com',
    username: overrides?.username || 'testuser',
    passwordHash: await hashPassword(overrides?.password || 'password123'),
    role: overrides?.role || UserRole.User,
    emailConfirmed: overrides?.emailConfirmed ?? true,
  };

  let user;
  try {
    user = await User.create(userData);
  } catch (error: any) {
    console.error('[helpers.ts] Error creating user:', error.message);
    console.error('[helpers.ts] Error name:', error.name);
    if (error.errors) {
      console.error('[helpers.ts] Validation errors:', JSON.stringify(error.errors, null, 2));
    }
    console.error('[helpers.ts] User data attempted:', JSON.stringify(userData, null, 2));
    throw error;
  }

  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    accessToken,
    refreshToken,
  };
}

export async function createAdminUser(): Promise<TestUser> {
  return createTestUser({
    email: 'admin@example.com',
    username: 'admin',
    role: UserRole.Admin,
  });
}

export async function createSuperuser(): Promise<TestUser> {
  return createTestUser({
    email: 'superuser@example.com',
    username: 'superuser',
    role: UserRole.Superuser,
  });
}
