import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { authInterceptor } from './auth.interceptor';
import { TokenStore } from '../auth/token-store';
import { API_BASE_URL } from './api-base-url.token';

const BASE = 'http://localhost:3000/api/v1';
const REFRESH_URL = 'http://localhost:3000/api/v1/auth/refresh';
const MOCK_USER = {
  id: '1', email: 'a@b.com', emailConfirmed: true, username: 'u',
  firstName: null, lastName: null, phoneNumber: null, bio: null,
  avatarUrl: null, role: 'User' as const, createdAt: '', updatedAt: '',
};

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let tokenStore: TokenStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } },
        { provide: API_BASE_URL, useValue: BASE },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    tokenStore = TestBed.inject(TokenStore);
    tokenStore.set(null);
  });

  afterEach(() => httpTesting.verify());

  it('attaches bearer token when present', () => {
    tokenStore.set('my-token');
    http.get(`${BASE}/events`).subscribe();
    const req = httpTesting.expectOne(`${BASE}/events`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-token');
    req.flush({});
  });

  it('does not attach Authorization header when token is null', () => {
    http.get(`${BASE}/events`).subscribe();
    const req = httpTesting.expectOne(`${BASE}/events`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('sets withCredentials on every request', () => {
    http.get(`${BASE}/events`).subscribe();
    const req = httpTesting.expectOne(`${BASE}/events`);
    expect(req.request.withCredentials).toBe(true);
    req.flush({});
  });

  it('on 401, refreshes token and retries original request', async () => {
    tokenStore.set('old-token');
    let result: unknown;
    http.get(`${BASE}/events`).subscribe((r) => (result = r));

    // Original request → 401
    httpTesting.expectOne(`${BASE}/events`).flush(
      { success: false, error: 'Unauthorized' },
      { status: 401, statusText: 'Unauthorized' }
    );

    // Interceptor fires refresh (via HttpBackend — still caught by test controller)
    httpTesting.expectOne(REFRESH_URL).flush({
      success: true,
      data: { accessToken: 'new-token', user: MOCK_USER },
    });

    // Retry with new token
    const retry = httpTesting.expectOne(`${BASE}/events`);
    expect(retry.request.headers.get('Authorization')).toBe('Bearer new-token');
    retry.flush({ success: true, data: [] });

    await Promise.resolve(); // flush microtask queue
    expect(tokenStore.get()).toBe('new-token');
  });

  it('does not retry 401 from /auth/refresh (loop guard)', async () => {
    let error: unknown;
    http.post(REFRESH_URL, {}).subscribe({ error: (e) => (error = e) });

    httpTesting.expectOne(REFRESH_URL).flush(
      { success: false, error: 'Invalid' },
      { status: 401, statusText: 'Unauthorized' }
    );

    await Promise.resolve();
    expect(error).toBeDefined();
    // No second refresh request should have been made
    httpTesting.expectNone(REFRESH_URL);
  });

  it('on refresh failure, clears token and navigates to /login', async () => {
    tokenStore.set('stale');
    let error: unknown;
    http.get(`${BASE}/events`).subscribe({ error: (e) => (error = e) });

    httpTesting.expectOne(`${BASE}/events`).flush(
      null,
      { status: 401, statusText: 'Unauthorized' }
    );
    httpTesting.expectOne(REFRESH_URL).flush(
      null,
      { status: 401, statusText: 'Unauthorized' }
    );

    await Promise.resolve();
    expect(tokenStore.get()).toBeNull();
    expect(error).toBeDefined();
  });

  it('concurrent 401s share exactly one refresh request', async () => {
    tokenStore.set('old');

    // Two simultaneous requests
    http.get(`${BASE}/events`).subscribe();
    http.get(`${BASE}/profile/me`).subscribe();

    // Both get 401
    httpTesting.expectOne(`${BASE}/events`).flush(
      null, { status: 401, statusText: 'Unauthorized' }
    );
    httpTesting.expectOne(`${BASE}/profile/me`).flush(
      null, { status: 401, statusText: 'Unauthorized' }
    );

    // Exactly ONE refresh should be pending
    const refreshReqs = httpTesting.match(REFRESH_URL);
    expect(refreshReqs.length).toBe(1);
    refreshReqs[0].flush({
      success: true,
      data: { accessToken: 'shared-new-token', user: MOCK_USER },
    });

    // Both retries use the new token
    const retry1 = httpTesting.expectOne(`${BASE}/events`);
    const retry2 = httpTesting.expectOne(`${BASE}/profile/me`);
    expect(retry1.request.headers.get('Authorization')).toBe('Bearer shared-new-token');
    expect(retry2.request.headers.get('Authorization')).toBe('Bearer shared-new-token');
    retry1.flush({});
    retry2.flush({});
  });
});
