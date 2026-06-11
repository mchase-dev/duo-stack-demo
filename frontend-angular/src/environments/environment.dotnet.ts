export const environment: {
  production: boolean;
  backend: 'node' | 'dotnet';
  apiUrl: string;
  realtimeBackend: 'socketio' | 'signalr';
} = {
  production: false,
  backend: 'dotnet',
  apiUrl: 'http://localhost:5000',
  realtimeBackend: 'signalr',
};
