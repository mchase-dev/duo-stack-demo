import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { AuthService } from './auth.service';
import { TokenStore } from './token-store';
import { API_BASE_URL } from '../http/api-base-url.token';

const BASE = 'http://localhost:3000/api/v1';
const MOCK_USER = {
  id: '1', email: 'a@b.com', emailConfirmed: true, username: 'alice',
  firstName: null, lastName: null, phoneNumber: null, bio: null,
  avatarUrl: null, role: 'User' as const, createdAt: '', updatedAt: '',
};

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;
  let tokenStore: TokenStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } },
        { provide: API_BASE_URL, useValue: BASE },
      ],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
    tokenStore = TestBed.inject(TokenStore);
  });

  afterEach(() => http.verify());

  it('starts with isLoading=true and no user', () => {
    expect(service.isLoading()).toBe(true);
    expect(service.isAuthenticated()).toBe(false);
    expect(service.user()).toBeNull();
  });

  it('initialize() on success sets user and clears loading', async () => {
    const p = service.initialize();
    http.expectOne(`${BASE}/auth/refresh`).flush({
      success: true,
      data: { accessToken: 'tok', user: MOCK_USER },
    });
    await p;
    expect(service.isAuthenticated()).toBe(true);
    expect(service.user()?.username).toBe('alice');
    expect(service.isLoading()).toBe(false);
    expect(tokenStore.get()).toBe('tok');
  });

  it('initialize() on failure leaves user null and clears loading', async () => {
    const p = service.initialize();
    http
      .expectOne(`${BASE}/auth/refresh`)
      .flush({ success: false, error: 'No session' }, { status: 401, statusText: 'Unauthorized' });
    await p;
    expect(service.isAuthenticated()).toBe(false);
    expect(service.isLoading()).toBe(false);
  });

  it('login() sets user and token', async () => {
    const p = service.login({ email: 'a@b.com', password: 'pw' });
    http.expectOne(`${BASE}/auth/login`).flush({
      success: true,
      data: { accessToken: 'login-tok', user: MOCK_USER },
    });
    await p;
    expect(service.isAuthenticated()).toBe(true);
    expect(tokenStore.get()).toBe('login-tok');
  });

  it('logout() clears user and token', async () => {
    tokenStore.set('some-token');
    service.setUser(MOCK_USER);
    const p = service.logout();
    http.expectOne(`${BASE}/auth/logout`).flush({ success: true, data: { message: 'ok' } });
    await p;
    expect(service.isAuthenticated()).toBe(false);
    expect(tokenStore.get()).toBeNull();
  });
});
