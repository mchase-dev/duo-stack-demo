import { io, Socket } from 'socket.io-client';
import type {
  RealtimeAdapter,
  ConnectionStatus,
  RoomMessageEvent,
  UserMessageEvent,
  EventCreatedEvent,
  EventUpdatedEvent,
  EventDeletedEvent,
  UserJoinedRoomEvent,
  UserLeftRoomEvent,
} from './RealtimeAdapter';

export class SocketIOAdapter implements RealtimeAdapter {
  private socket: Socket | null = null;
  private status: ConnectionStatus = 'disconnected';
  private statusCallbacks: Array<(status: ConnectionStatus) => void> = [];
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async connect(accessToken: string): Promise<void> {
    if (this.socket?.connected) {
      return;
    }

    this.updateStatus('connecting');

    return new Promise((resolve, reject) => {
      this.socket = io(this.apiUrl, {
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

      this.socket.on('disconnect', () => {
        this.updateStatus('disconnected');
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
        this.updateStatus('error');
        reject(error);
      });

      this.socket.on('error', (error) => {
        console.error('Socket.IO error:', error);
        this.updateStatus('error');
      });
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

  async joinRoom(roomId: string): Promise<void> {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('joinRoom', roomId, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error || 'Failed to join room'));
        }
      });
    });
  }

  async leaveRoom(roomId: string): Promise<void> {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('leaveRoom', roomId, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error || 'Failed to leave room'));
        }
      });
    });
  }

  async sendToRoom(roomId: string, message: string): Promise<void> {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit(
        'sendToRoom',
        { roomId, message },
        (response: { success: boolean; error?: string }) => {
          if (response.success) {
            resolve();
          } else {
            reject(new Error(response.error || 'Failed to send message'));
          }
        }
      );
    });
  }

  onRoomMessage(callback: (event: RoomMessageEvent) => void): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    this.socket.on('roomMessage', callback);
  }

  onUserMessage(callback: (event: UserMessageEvent) => void): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    this.socket.on('userMessage', callback);
  }

  onEventCreated(callback: (event: EventCreatedEvent) => void): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    this.socket.on('eventCreated', callback);
  }

  onEventUpdated(callback: (event: EventUpdatedEvent) => void): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    this.socket.on('eventUpdated', callback);
  }

  onEventDeleted(callback: (event: EventDeletedEvent) => void): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    this.socket.on('eventDeleted', callback);
  }

  onUserJoinedRoom(callback: (event: UserJoinedRoomEvent) => void): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    this.socket.on('userJoinedRoom', callback);
  }

  onUserLeftRoom(callback: (event: UserLeftRoomEvent) => void): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    this.socket.on('userLeftRoom', callback);
  }

  onUserOnline(callback: (event: { userId: string }) => void): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    this.socket.on('userOnline', callback);
  }

  onUserOffline(callback: (event: { userId: string }) => void): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    this.socket.on('userOffline', callback);
  }

  onStatusChange(callback: (status: ConnectionStatus) => void): void {
    this.statusCallbacks.push(callback);
  }

  removeAllListeners(): void {
    if (this.socket) {
      this.socket.off('roomMessage');
      this.socket.off('userMessage');
      this.socket.off('eventCreated');
      this.socket.off('eventUpdated');
      this.socket.off('eventDeleted');
      this.socket.off('userJoinedRoom');
      this.socket.off('userLeftRoom');
      this.socket.off('roomMembers');
      this.socket.off('userOnline');
      this.socket.off('userOffline');
    }
    this.statusCallbacks = [];
  }

  on(eventName: string, callback: (data: any) => void): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    this.socket.on(eventName, callback);
  }

  off(eventName: string): void {
    if (this.socket) {
      this.socket.off(eventName);
    }
  }

  private updateStatus(status: ConnectionStatus): void {
    this.status = status;
    this.statusCallbacks.forEach((callback) => callback(status));
  }
}
