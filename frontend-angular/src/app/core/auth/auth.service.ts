import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import type { LoginRequest, RegisterRequest, User } from '../api/api.types';
import { AuthApiService } from '../api/auth.api';
import { TokenStore } from './token-store';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenStore = inject(TokenStore);
  private readonly authApi = inject(AuthApiService);
  private readonly router = inject(Router);

  private readonly _user = signal<User | null>(null);
  private readonly _isLoading = signal(true);

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => !!this._user());
  readonly isLoading = this._isLoading.asReadonly();

  // Called by provideAppInitializer — restores session from HttpOnly refresh cookie
  async initialize(): Promise<void> {
    try {
      const res = await firstValueFrom(this.authApi.refresh());
      this.tokenStore.set(res.data.accessToken);
      this._user.set(res.data.user);
    } catch {
      this._user.set(null);
    } finally {
      this._isLoading.set(false);
    }
  }

  async login(data: LoginRequest): Promise<void> {
    const res = await firstValueFrom(this.authApi.login(data));
    this.tokenStore.set(res.data.accessToken);
    this._user.set(res.data.user);
  }

  async register(data: RegisterRequest): Promise<void> {
    const res = await firstValueFrom(this.authApi.register(data));
    this.tokenStore.set(res.data.accessToken);
    this._user.set(res.data.user);
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.authApi.logout());
    } finally {
      this.clearSession();
      this.router.navigate(['/login']);
    }
  }

  // Called by the interceptor after a successful background token refresh
  setUser(user: User): void {
    this._user.set(user);
  }

  // Called by the interceptor when a refresh fails — drops token and user state
  clearSession(): void {
    this.tokenStore.set(null);
    this._user.set(null);
  }
}
