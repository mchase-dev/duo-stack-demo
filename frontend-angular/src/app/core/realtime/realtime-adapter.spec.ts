import { vi, describe, it, expect, beforeEach } from 'vitest';
import { SignalRAdapterService } from './signalr-adapter.service';
import { SocketIOAdapterService } from './socketio-adapter.service';

// ── Hoisted mock state (available to vi.mock factories) ────────────────────

const { mockConnection, mockBuilderInstance } = vi.hoisted(() => {
  const mockConnection = {
    state: 'Disconnected' as string,
    start: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn().mockResolvedValue(undefined),
    invoke: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
    off: vi.fn(),
    onclose: vi.fn(),
    onreconnecting: vi.fn(),
    onreconnected: vi.fn(),
  };
  const mockBuilderInstance = {
    withUrl: vi.fn().mockReturnThis(),
    withAutomaticReconnect: vi.fn().mockReturnThis(),
    configureLogging: vi.fn().mockReturnThis(),
    build: vi.fn().mockReturnValue(mockConnection),
  };
  return { mockConnection, mockBuilderInstance };
});

const { mockSocket } = vi.hoisted(() => ({
  mockSocket: {
    connected: false,
    disconnect: vi.fn(),
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  },
}));

// ── Module mocks ───────────────────────────────────────────────────────────

vi.mock('@microsoft/signalr', () => ({
  // Regular function (not arrow) so it can be used as a constructor with `new`
  HubConnectionBuilder: vi.fn(function () { return mockBuilderInstance; }),
  HubConnectionState: { Connected: 'Connected', Disconnected: 'Disconnected' },
  HttpTransportType: { WebSockets: 1, ServerSentEvents: 2 },
  LogLevel: { Warning: 1 },
}));

vi.mock('socket.io-client', () => ({
  io: vi.fn().mockReturnValue(mockSocket),
}));

// ── SignalR tests ──────────────────────────────────────────────────────────

describe('SignalRAdapterService', () => {
  let adapter: SignalRAdapterService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockConnection.state = 'Disconnected';
    mockBuilderInstance.withUrl.mockReturnThis();
    mockBuilderInstance.withAutomaticReconnect.mockReturnThis();
    mockBuilderInstance.configureLogging.mockReturnThis();
    mockBuilderInstance.build.mockReturnValue(mockConnection);
    adapter = new SignalRAdapterService('http://localhost:5000/hubs/rooms');
  });

  it('starts disconnected', () => {
    expect(adapter.getStatus()).toBe('disconnected');
  });

  it('connect() builds connection and calls start()', async () => {
    mockConnection.state = 'Connected';
    await adapter.connect('token');
    expect(mockBuilderInstance.withUrl).toHaveBeenCalledWith(
      'http://localhost:5000/hubs/rooms',
      expect.objectContaining({ accessTokenFactory: expect.any(Function) })
    );
    expect(mockConnection.start).toHaveBeenCalled();
    expect(adapter.getStatus()).toBe('connected');
  });

  it('joinRoom() invokes JoinRoom on connection', async () => {
    mockConnection.state = 'Connected';
    await adapter.connect('token');
    await adapter.joinRoom('room-1');
    expect(mockConnection.invoke).toHaveBeenCalledWith('JoinRoom', 'room-1');
  });

  it('onStatusChange fires during connect', async () => {
    const cb = vi.fn();
    adapter.onStatusChange(cb);
    mockConnection.state = 'Connected';
    await adapter.connect('token');
    expect(cb).toHaveBeenCalledWith('connecting');
    expect(cb).toHaveBeenCalledWith('connected');
  });

  it('removeAllListeners clears status callbacks', async () => {
    mockConnection.state = 'Connected';
    await adapter.connect('token');
    const cb = vi.fn();
    adapter.onStatusChange(cb);
    adapter.removeAllListeners();
    adapter.disconnect();
    expect(cb).not.toHaveBeenCalled();
  });
});

// ── Socket.IO tests ────────────────────────────────────────────────────────

describe('SocketIOAdapterService', () => {
  let adapter: SocketIOAdapterService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSocket.connected = false;
    adapter = new SocketIOAdapterService('http://localhost:3000');
  });

  it('starts disconnected', () => {
    expect(adapter.getStatus()).toBe('disconnected');
  });

  it('connect() calls io() with auth token then resolves on connect event', async () => {
    const { io } = await import('socket.io-client');
    // Immediately trigger the 'connect' event after io() is called
    (mockSocket.on as ReturnType<typeof vi.fn>).mockImplementation(
      (event: string, cb: () => void) => { if (event === 'connect') cb(); }
    );
    await adapter.connect('my-token');
    expect(io).toHaveBeenCalledWith(
      'http://localhost:3000',
      expect.objectContaining({ auth: { token: 'my-token' } })
    );
    expect(adapter.getStatus()).toBe('connected');
  });

  it('joinRoom() emits joinRoom and resolves on success ack', async () => {
    // Bypass connect — set socket directly
    (adapter as unknown as { socket: typeof mockSocket }).socket = mockSocket;
    mockSocket.emit.mockImplementation(
      (_e: string, _id: string, cb: (r: { success: boolean }) => void) => cb({ success: true })
    );
    await expect(adapter.joinRoom('room-1')).resolves.toBeUndefined();
    expect(mockSocket.emit).toHaveBeenCalledWith('joinRoom', 'room-1', expect.any(Function));
  });

  it('joinRoom() rejects on ack error', async () => {
    (adapter as unknown as { socket: typeof mockSocket }).socket = mockSocket;
    mockSocket.emit.mockImplementation(
      (_e: string, _id: string, cb: (r: { success: boolean; error: string }) => void) =>
        cb({ success: false, error: 'forbidden' })
    );
    await expect(adapter.joinRoom('room-1')).rejects.toThrow('forbidden');
  });
});
