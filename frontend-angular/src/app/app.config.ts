import {
  ApplicationConfig,
  ErrorHandler,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { authInterceptor } from './core/http/auth.interceptor';
import { API_BASE_URL } from './core/http/api-base-url.token';
import { AuthService } from './core/auth/auth.service';
import { GlobalErrorHandler } from './core/error-handler.service';
import { provideRealtime } from './core/realtime/realtime.provider';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
    { provide: API_BASE_URL, useValue: `${environment.apiUrl}/api/v1` },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    provideAppInitializer(() => inject(AuthService).initialize()),
    provideRealtime(),
  ],
};
