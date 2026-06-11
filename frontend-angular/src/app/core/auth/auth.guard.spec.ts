import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { signal, computed } from '@angular/core';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';
import type { User } from '../api/api.types';

function makeState(url: string): RouterStateSnapshot {
  return { url } as RouterStateSnapshot;
}

describe('authGuard', () => {
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

  function run(url = '/protected') {
    return TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, makeState(url))
    );
  }

  it('returns true when authenticated', () => {
    mockUser.set({
      id: '1', email: 'a@b.com', emailConfirmed: true, username: 'u',
      firstName: null, lastName: null, phoneNumber: null, bio: null,
      avatarUrl: null, role: 'User', createdAt: '', updatedAt: '',
    });
    expect(run()).toBe(true);
  });

  it('redirects to /login when unauthenticated', () => {
    const result = run('/calendar') as UrlTree;
    expect(result.toString()).toContain('/login');
    expect(result.queryParams['returnUrl']).toBe('/calendar');
  });
});
