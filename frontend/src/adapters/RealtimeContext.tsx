import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import type { RealtimeAdapter, ConnectionStatus } from "./RealtimeAdapter";
import { SocketIOAdapter } from "./SocketIOAdapter";
import { SignalRAdapter } from "./SignalRAdapter";

interface RealtimeContextValue {
  adapter: RealtimeAdapter | null;
  status: ConnectionStatus;
  connect: (accessToken: string) => Promise<void>;
  disconnect: () => void;
  error: Error | null;
}

const RealtimeContext = createContext<RealtimeContextValue | undefined>(
  undefined
);

interface RealtimeProviderProps {
  children: ReactNode;
  backend: "node" | "dotnet";
  apiUrl: string;
}

export const RealtimeProvider: React.FC<RealtimeProviderProps> = ({
  children,
  backend,
  apiUrl,
}) => {
  const [adapter, setAdapter] = useState<RealtimeAdapter | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [error, setError] = useState<Error | null>(null);

  // Initialize adapter based on backend type
  useEffect(() => {
    let newAdapter: RealtimeAdapter;

    if (backend === "node") {
      // Socket.IO adapter for Node.js backend
      newAdapter = new SocketIOAdapter(apiUrl);
    } else {
      // SignalR adapter for .NET backend
      const hubUrl = `${apiUrl}/hubs/rooms`;
      newAdapter = new SignalRAdapter(hubUrl);
    }

    // Listen for status changes
    newAdapter.onStatusChange((newStatus) => {
      setStatus(newStatus);
    });

    setAdapter(newAdapter);

    // Cleanup on unmount
    return () => {
      if (newAdapter.getStatus() === "connected") {
        newAdapter.disconnect();
      }
      newAdapter.removeAllListeners();
    };
  }, [backend, apiUrl]);

  const connect = useCallback(
    async (accessToken: string) => {
      if (!adapter) {
        throw new Error("Adapter not initialized");
      }

      try {
        setError(null);
        await adapter.connect(accessToken);
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to connect");
        setError(error);
        throw error;
      }
    },
    [adapter]
  );

  const disconnect = useCallback(() => {
    if (adapter) {
      adapter.disconnect();
      setError(null);
    }
  }, [adapter]);

  const value: RealtimeContextValue = {
    adapter,
    status,
    connect,
    disconnect,
    error,
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};

/**
 * Hook to use RealtimeAdapter in components
 */
export const useRealtime = (): RealtimeContextValue => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error("useRealtime must be used within RealtimeProvider");
  }
  return context;
};

/**
 * Hook to get connection status
 */
export const useRealtimeStatus = (): ConnectionStatus => {
  const { status } = useRealtime();
  return status;
};
