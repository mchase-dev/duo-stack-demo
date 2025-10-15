import * as signalR from '@microsoft/signalr';
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

export class SignalRAdapter implements RealtimeAdapter {
  private connection: signalR.HubConnection | null = null;
  private status: ConnectionStatus = 'disconnected';
  private statusCallbacks: Array<(status: ConnectionStatus) => void> = [];
  private hubUrl: string;

  constructor(hubUrl: string) {
    this.hubUrl = hubUrl;
  }

  async connect(accessToken: string): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    this.updateStatus('connecting');

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        accessTokenFactory: () => accessToken,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          if (retryContext.elapsedMilliseconds < 60000) {
            return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 5000);
          } else {
            return null; // Stop retrying after 60 seconds
          }
        },
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.connection.onclose((error) => {
      if (error) {
        console.error('SignalR connection closed with error:', error);
        this.updateStatus('error');
      } else {
        this.updateStatus('disconnected');
      }
    });

    this.connection.onreconnecting((error) => {
      console.warn('SignalR reconnecting:', error);
      this.updateStatus('connecting');
    });

    this.connection.onreconnected(() => {
      console.log('SignalR reconnected');
      this.updateStatus('connected');
    });

    try {
      await this.connection.start();
      this.updateStatus('connected');
    } catch (error) {
      console.error('SignalR connection error:', error);
      this.updateStatus('error');
      throw error;
    }
  }

  disconnect(): void {
    if (this.connection) {
      this.connection.stop();
      this.connection = null;
      this.updateStatus('disconnected');
    }
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  async joinRoom(roomId: string): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('SignalR not connected');
    }

    try {
      await this.connection.invoke('JoinRoom', roomId);
    } catch (error) {
      console.error('Failed to join room:', error);
      throw error;
    }
  }

  async leaveRoom(roomId: string): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('SignalR not connected');
    }

    try {
      await this.connection.invoke('LeaveRoom', roomId);
    } catch (error) {
      console.error('Failed to leave room:', error);
      throw error;
    }
  }

  async sendToRoom(roomId: string, message: string): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('SignalR not connected');
    }

    try {
      await this.connection.invoke('SendToRoom', roomId, message);
    } catch (error) {
      console.error('Failed to send message to room:', error);
      throw error;
    }
  }

  onRoomMessage(callback: (event: RoomMessageEvent) => void): void {
    if (!this.connection) {
      throw new Error('SignalR not connected');
    }
    this.connection.on('RoomMessage', callback);
  }

  onUserMessage(callback: (event: UserMessageEvent) => void): void {
    if (!this.connection) {
      throw new Error('SignalR not connected');
    }
    this.connection.on('UserMessage', callback);
  }

  onEventCreated(callback: (event: EventCreatedEvent) => void): void {
    if (!this.connection) {
      throw new Error('SignalR not connected');
    }
    this.connection.on('EventCreated', callback);
  }

  onEventUpdated(callback: (event: EventUpdatedEvent) => void): void {
    if (!this.connection) {
      throw new Error('SignalR not connected');
    }
    this.connection.on('EventUpdated', callback);
  }

  onEventDeleted(callback: (event: EventDeletedEvent) => void): void {
    if (!this.connection) {
      throw new Error('SignalR not connected');
    }
    this.connection.on('EventDeleted', callback);
  }

  onUserJoinedRoom(callback: (event: UserJoinedRoomEvent) => void): void {
    if (!this.connection) {
      throw new Error('SignalR not connected');
    }
    this.connection.on('UserJoinedRoom', callback);
  }

  onUserLeftRoom(callback: (event: UserLeftRoomEvent) => void): void {
    if (!this.connection) {
      throw new Error('SignalR not connected');
    }
    this.connection.on('UserLeftRoom', callback);
  }

  onUserOnline(callback: (event: { userId: string }) => void): void {
    if (!this.connection) {
      throw new Error('SignalR not connected');
    }
    this.connection.on('UserOnline', callback);
  }

  onUserOffline(callback: (event: { userId: string }) => void): void {
    if (!this.connection) {
      throw new Error('SignalR not connected');
    }
    this.connection.on('UserOffline', callback);
  }

  onStatusChange(callback: (status: ConnectionStatus) => void): void {
    this.statusCallbacks.push(callback);
  }

  removeAllListeners(): void {
    if (this.connection) {
      this.connection.off('RoomMessage');
      this.connection.off('UserMessage');
      this.connection.off('EventCreated');
      this.connection.off('EventUpdated');
      this.connection.off('EventDeleted');
      this.connection.off('UserJoinedRoom');
      this.connection.off('UserLeftRoom');
      this.connection.off('RoomMembers');
      this.connection.off('UserOnline');
      this.connection.off('UserOffline');
    }
    this.statusCallbacks = [];
  }

  on(eventName: string, callback: (data: any) => void): void {
    if (!this.connection) {
      throw new Error('SignalR not connected');
    }
    this.connection.on(eventName, callback);
  }

  off(eventName: string): void {
    if (this.connection) {
      this.connection.off(eventName);
    }
  }

  private updateStatus(status: ConnectionStatus): void {
    this.status = status;
    this.statusCallbacks.forEach((callback) => callback(status));
  }
}
