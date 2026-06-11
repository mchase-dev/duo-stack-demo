import { io, Socket } from 'socket.io-client';
import {
  ConnectionStatus,
  EventCreatedEvent,
  EventDeletedEvent,
  EventUpdatedEvent,
  RealtimeAdapter,
  RoomMessageEvent,
  UserJoinedRoomEvent,
  UserLeftRoomEvent,
  UserMessageEvent,
  UserOfflineEvent,
  UserOnlineEvent,
} from './realtime-adapter';

export class SocketIOAdapterService extends RealtimeAdapter {
  private socket: Socket | null = null;
  private status: ConnectionStatus = 'disconnected';
  private statusCallbacks: Array<(status: ConnectionStatus) => void> = [];

  constructor(private readonly serverUrl: string) {
    super();
  }

  connect(accessToken: string): Promise<void> {
    if (this.socket?.connected) return Promise.resolve();
    this.updateStatus('connecting');

    return new Promise((resolve, reject) => {
      this.socket = io(this.serverUrl, {
        auth: { token: accessToken },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      this.socket.on('connect', () => {
        this.updateStatus('connected');
        resolve();
      });
      this.socket.on('disconnect', () => this.updateStatus('disconnected'));
      this.socket.on('connect_error', (err) => {
        this.updateStatus('error');
        reject(err);
      });
      this.socket.on('error', () => this.updateStatus('error'));
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.updateStatus('disconnected');
    }
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  joinRoom(roomId: string): Promise<void> {
    this.assertConnected();
    return new Promise((resolve, reject) => {
      this.socket!.emit('joinRoom', roomId, (res: { success: boolean; error?: string }) => {
        res.success ? resolve() : reject(new Error(res.error ?? 'Failed to join room'));
      });
    });
  }

  leaveRoom(roomId: string): Promise<void> {
    this.assertConnected();
    return new Promise((resolve, reject) => {
      this.socket!.emit('leaveRoom', roomId, (res: { success: boolean; error?: string }) => {
        res.success ? resolve() : reject(new Error(res.error ?? 'Failed to leave room'));
      });
    });
  }

  sendToRoom(roomId: string, message: string): Promise<void> {
    this.assertConnected();
    return new Promise((resolve, reject) => {
      this.socket!.emit(
        'sendToRoom',
        { roomId, message },
        (res: { success: boolean; error?: string }) => {
          res.success ? resolve() : reject(new Error(res.error ?? 'Failed to send message'));
        }
      );
    });
  }

  onRoomMessage(cb: (e: RoomMessageEvent) => void): void {
    this.assertConnected();
    this.socket!.on('roomMessage', cb);
  }

  onUserMessage(cb: (e: UserMessageEvent) => void): void {
    this.assertConnected();
    this.socket!.on('userMessage', cb);
  }

  onEventCreated(cb: (e: EventCreatedEvent) => void): void {
    this.assertConnected();
    this.socket!.on('eventCreated', cb);
  }

  onEventUpdated(cb: (e: EventUpdatedEvent) => void): void {
    this.assertConnected();
    this.socket!.on('eventUpdated', cb);
  }

  onEventDeleted(cb: (e: EventDeletedEvent) => void): void {
    this.assertConnected();
    this.socket!.on('eventDeleted', cb);
  }

  onUserJoinedRoom(cb: (e: UserJoinedRoomEvent) => void): void {
    this.assertConnected();
    this.socket!.on('userJoinedRoom', cb);
  }

  onUserLeftRoom(cb: (e: UserLeftRoomEvent) => void): void {
    this.assertConnected();
    this.socket!.on('userLeftRoom', cb);
  }

  onUserOnline(cb: (e: UserOnlineEvent) => void): void {
    this.assertConnected();
    this.socket!.on('userOnline', cb);
  }

  onUserOffline(cb: (e: UserOfflineEvent) => void): void {
    this.assertConnected();
    this.socket!.on('userOffline', cb);
  }

  onStatusChange(cb: (status: ConnectionStatus) => void): void {
    this.statusCallbacks.push(cb);
  }

  removeAllListeners(): void {
    if (this.socket) {
      for (const name of [
        'roomMessage', 'userMessage', 'eventCreated', 'eventUpdated',
        'eventDeleted', 'userJoinedRoom', 'userLeftRoom', 'roomMembers',
        'userOnline', 'userOffline',
      ]) {
        this.socket.off(name);
      }
    }
    this.statusCallbacks = [];
  }

  on(eventName: string, cb: (data: unknown) => void): void {
    this.assertConnected();
    this.socket!.on(eventName, cb as never);
  }

  off(eventName: string): void {
    this.socket?.off(eventName);
  }

  private assertConnected(): void {
    if (!this.socket) throw new Error('Socket not connected');
  }

  private updateStatus(status: ConnectionStatus): void {
    this.status = status;
    this.statusCallbacks.forEach((cb) => cb(status));
  }
}
