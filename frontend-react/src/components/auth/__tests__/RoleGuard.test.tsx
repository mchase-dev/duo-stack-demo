/**
 * RoleGuard Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '../../../test/test-utils';
import { RoleGuard } from '../RoleGuard';
import { useAuthStore } from '../../../store/authStore';
import { mockUser, mockAdminUser, mockSuperuser } from '../../../test/mocks/api';

// Mock the auth store
vi.mock('../../../store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

describe('RoleGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when user has required role', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: mockAdminUser,
      isAuthenticated: true,
      isLoading: false,
      setUser: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <RoleGuard roles={['Admin']}>
        <div>Admin Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('renders children when user has one of multiple required roles', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: mockAdminUser,
      isAuthenticated: true,
      isLoading: false,
      setUser: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <RoleGuard roles={['Admin', 'Superuser']}>
        <div>Admin or Superuser Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('Admin or Superuser Content')).toBeInTheDocument();
  });

  it('shows access denied when user does not have required role', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: mockUser, // Regular user
      isAuthenticated: true,
      isLoading: false,
      setUser: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <RoleGuard roles={['Admin']}>
        <div>Admin Content</div>
      </RoleGuard>
    );

    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    expect(screen.getByText(/access denied/i)).toBeInTheDocument();
  });

  it('shows access denied when user is not authenticated', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      setUser: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <RoleGuard roles={['Admin']}>
        <div>Admin Content</div>
      </RoleGuard>
    );

    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    expect(screen.getByText(/access denied/i)).toBeInTheDocument();
  });

  it('allows Superuser to access all roles', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: mockSuperuser,
      isAuthenticated: true,
      isLoading: false,
      setUser: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <RoleGuard roles={['Admin']}>
        <div>Admin Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <RoleGuard roles={['Admin']}>
        <div>Admin Content</div>
      </RoleGuard>
    );

    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    // Loading component should be rendered
  });
});
