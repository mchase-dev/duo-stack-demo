import { useEffect } from 'react';
import { useRealtime } from '../adapters/RealtimeContext';
import { useAuthStore } from '../store/authStore';
import { getAccessToken } from '../api/client';

export const useRealtimeConnection = () => {
  const { connect, disconnect, status, error } = useRealtime();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const connectRealtime = async () => {
      console.log('[useRealtimeConnection] Status:', status, 'Authenticated:', isAuthenticated);

      // Only connect if authenticated and not already connected/connecting
      if (isAuthenticated && status === 'disconnected') {
        const accessToken = getAccessToken();

        if (!accessToken) {
          console.warn('[useRealtimeConnection] No access token available for realtime connection');
          return;
        }

        console.log('[useRealtimeConnection] Attempting to connect to SignalR...');
        try {
          await connect(accessToken);
          console.log('[useRealtimeConnection] Realtime connected successfully');
        } catch (err) {
          console.error('[useRealtimeConnection] Failed to connect realtime:', err);
        }
      }

      // Disconnect when user logs out
      if (!isAuthenticated && (status === 'connected' || status === 'connecting')) {
        console.log('[useRealtimeConnection] Disconnecting realtime');
        disconnect();
      }
    };

    connectRealtime();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, status]); // Removed connect/disconnect from deps to prevent infinite loops

  return { status, error };
};
