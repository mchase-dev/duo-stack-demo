export const environment: {
  production: boolean;
  backend: 'node' | 'dotnet';
  apiUrl: string;
  realtimeBackend: 'socketio' | 'signalr';
} = {
  production: false,
  backend: 'node',
  apiUrl: 'http://localhost:3000',
  realtimeBackend: 'socketio',
};
