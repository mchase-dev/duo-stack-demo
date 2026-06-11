import { Injectable, inject, signal, effect } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { TokenStore } from '../auth/token-store';
import { ConnectionStatus, RealtimeAdapter } from './realtime-adapter';

@Injectable({ providedIn: 'root' })
export class RealtimeConnectionService {
  private readonly authService = inject(AuthService);
  private readonly tokenStore = inject(TokenStore);
  private readonly adapter = inject(RealtimeAdapter);

  readonly status = signal<ConnectionStatus>('disconnected');

  constructor() {
    // Mirror auth state → connect/disconnect realtime transport
    effect(() => {
      if (this.authService.isAuthenticated()) {
        const token = this.tokenStore.get();
        if (token) {
          this.adapter
            .connect(token)
            .catch(() => this.status.set('error'));
        }
      } else {
        this.adapter.disconnect();
        this.status.set('disconnected');
      }
    });

    this.adapter.onStatusChange((s) => this.status.set(s));
  }
}
