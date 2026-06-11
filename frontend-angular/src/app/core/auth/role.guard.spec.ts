import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { signal, computed } from '@angular/core';
import { roleGuard } from './role.guard';
import { AuthService } from './auth.service';
import type { User } from '../api/api.types';

function makeUser(role: User['role']): User {
  return {
    id: '1', email: 'a@b.com', emailConfirmed: true, username: 'u',
    firstName: null, lastName: null, phoneNumber: null, bio: null,
    avatarUrl: null, role, createdAt: '', updatedAt: '',
  };
}

describe('roleGuard', () => {
  const mockUser = signal<User | null>(null);
  const mockAuthService = {
    user: mockUser.asReadonly(),
    isAuthenticated: computed(() => !!mockUser()),
  };

  beforeEach(() => {
    mockUser.set(null);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
      ],
    });
  });

  function run(requiredRole: User['role']) {
    return TestBed.runInInjectionContext(() =>
      roleGuard(requiredRole)({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
  }

  it('redirects to /login when no user', () => {
    const result = run('Admin') as UrlTree;
    expect(result.toString()).toContain('/login');
  });

  it('Superuser passes any role check', () => {
    mockUser.set(makeUser('Superuser'));
    expect(run('Admin')).toBe(true);
    expect(run('Superuser')).toBe(true);
  });

  it('Admin passes Admin check', () => {
    mockUser.set(makeUser('Admin'));
    expect(run('Admin')).toBe(true);
  });

  it('User fails Admin check and redirects to /dashboard', () => {
    mockUser.set(makeUser('User'));
    const result = run('Admin') as UrlTree;
    expect(result.toString()).toContain('/dashboard');
  });
});
