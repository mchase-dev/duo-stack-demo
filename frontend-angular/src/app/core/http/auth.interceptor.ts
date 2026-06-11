import {
  HttpBackend,
  HttpClient,
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  Observable,
  catchError,
  finalize,
  map,
  shareReplay,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiResponse, User } from '../api/api.types';
import { TokenStore } from '../auth/token-store';

// Module-level shared refresh — ensures concurrent 401s trigger exactly one refresh POST
let refreshInFlight$: Observable<string> | null = null;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStore = inject(TokenStore);
  const router = inject(Router);
  const httpBackend = inject(HttpBackend);

  const token = tokenStore.get();
  const authReq = req.clone({
    withCredentials: true,
    ...(token ? { setHeaders: { Authorization: `Bearer ${token}` } } : {}),
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Loop guard: never retry a refresh request itself
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        return handleRefresh(tokenStore, router, httpBackend, authReq, next);
      }
      return throwError(() => error);
    })
  );
};

function handleRefresh(
  tokenStore: TokenStore,
  router: Router,
  httpBackend: HttpBackend,
  originalReq: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  if (!refreshInFlight$) {
    // Use HttpBackend directly to bypass the auth interceptor on the refresh call
    refreshInFlight$ = new HttpClient(httpBackend)
      .post<ApiResponse<{ accessToken: string; user: User }>>(
        `${environment.apiUrl}/api/v1/auth/refresh`,
        {},
        { withCredentials: true }
      )
      .pipe(
        map((res) => res.data.accessToken),
        tap((token) => tokenStore.set(token)),
        // finalize before shareReplay so it runs once when source completes
        finalize(() => (refreshInFlight$ = null)),
        shareReplay(1)
      );
  }

  return refreshInFlight$.pipe(
    switchMap((newToken) =>
      next(
        originalReq.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } })
      )
    ),
    catchError((err) => {
      tokenStore.set(null);
      router.navigate(['/login']);
      return throwError(() => err);
    })
  );
}
