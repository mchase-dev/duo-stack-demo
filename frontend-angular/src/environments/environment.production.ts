export const environment: {
  production: boolean;
  backend: 'node' | 'dotnet';
  apiUrl: string;
  realtimeBackend: 'socketio' | 'signalr';
} = {
  production: true,
  backend: 'node',
  apiUrl: '',
  realtimeBackend: 'socketio',
};
