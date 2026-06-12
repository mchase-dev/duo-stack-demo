import { Provider, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { TokenStore } from '../auth/token-store';
import { RealtimeAdapter } from './realtime-adapter';
import { SignalRAdapterService } from './signalr-adapter.service';
import { SocketIOAdapterService } from './socketio-adapter.service';

export function provideRealtime(): Provider {
  return {
    provide: RealtimeAdapter,
    useFactory: () => {
      if (environment.realtimeBackend === 'signalr') {
        const tokenStore = inject(TokenStore);
        return new SignalRAdapterService(`${environment.apiUrl}/hubs/rooms`, () =>
          tokenStore.get()
        );
      }
      return new SocketIOAdapterService(environment.apiUrl);
    },
  };
}
