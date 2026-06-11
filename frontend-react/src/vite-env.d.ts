/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_BACKEND: 'node' | 'dotnet';
  readonly VITE_REALTIME_BACKEND: 'socketio' | 'signalr';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
