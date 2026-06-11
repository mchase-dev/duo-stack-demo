import { Provider } from '@angular/core';
import { environment } from '../../../environments/environment';
import { RealtimeAdapter } from './realtime-adapter';
import { SignalRAdapterService } from './signalr-adapter.service';
import { SocketIOAdapterService } from './socketio-adapter.service';

export function provideRealtime(): Provider {
  return {
    provide: RealtimeAdapter,
    useFactory: () =>
      environment.realtimeBackend === 'signalr'
        ? new SignalRAdapterService(`${environment.apiUrl}/hubs/rooms`)
        : new SocketIOAdapterService(environment.apiUrl),
  };
}
