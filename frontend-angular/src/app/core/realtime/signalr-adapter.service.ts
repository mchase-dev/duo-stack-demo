import * as signalR from '@microsoft/signalr';
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

export class SignalRAdapterService extends RealtimeAdapter {
  private connection: signalR.HubConnection | null = null;
  private status: ConnectionStatus = 'disconnected';
  private statusCallbacks: Array<(status: ConnectionStatus) => void> = [];

  constructor(private readonly hubUrl: string) {
    super();
  }

  async connect(accessToken: string): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) return;

    this.updateStatus('connecting');

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        accessTokenFactory: () => accessToken,
        transport:
          signalR.HttpTransportType.WebSockets |
          signalR.HttpTransportType.ServerSentEvents,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (ctx) =>
          ctx.elapsedMilliseconds < 60000
            ? Math.min(1000 * Math.pow(2, ctx.previousRetryCount), 5000)
            : null,
      })
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    this.connection.onclose((err) =>
      this.updateStatus(err ? 'error' : 'disconnected')
    );
    this.connection.onreconnecting(() => this.updateStatus('connecting'));
    this.connection.onreconnected(() => this.updateStatus('connected'));

    try {
      await this.connection.start();
      this.updateStatus('connected');
    } catch (err) {
      this.updateStatus('error');
      throw err;
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
    this.assertConnected();
    await this.connection!.invoke('JoinRoom', roomId);
  }

  async leaveRoom(roomId: string): Promise<void> {
    this.assertConnected();
    await this.connection!.invoke('LeaveRoom', roomId);
  }

  async sendToRoom(roomId: string, message: string): Promise<void> {
    this.assertConnected();
    await this.connection!.invoke('SendToRoom', roomId, message);
  }

  onRoomMessage(cb: (e: RoomMessageEvent) => void): void {
    this.assertConnected();
    this.connection!.on('RoomMessage', cb);
  }

  onUserMessage(cb: (e: UserMessageEvent) => void): void {
    this.assertConnected();
    this.connection!.on('UserMessage', cb);
  }

  onEventCreated(cb: (e: EventCreatedEvent) => void): void {
    this.assertConnected();
    this.connection!.on('EventCreated', cb);
  }

  onEventUpdated(cb: (e: EventUpdatedEvent) => void): void {
    this.assertConnected();
    this.connection!.on('EventUpdated', cb);
  }

  onEventDeleted(cb: (e: EventDeletedEvent) => void): void {
    this.assertConnected();
    this.connection!.on('EventDeleted', cb);
  }

  onUserJoinedRoom(cb: (e: UserJoinedRoomEvent) => void): void {
    this.assertConnected();
    this.connection!.on('UserJoinedRoom', cb);
  }

  onUserLeftRoom(cb: (e: UserLeftRoomEvent) => void): void {
    this.assertConnected();
    this.connection!.on('UserLeftRoom', cb);
  }

  onUserOnline(cb: (e: UserOnlineEvent) => void): void {
    this.assertConnected();
    this.connection!.on('UserOnline', cb);
  }

  onUserOffline(cb: (e: UserOfflineEvent) => void): void {
    this.assertConnected();
    this.connection!.on('UserOffline', cb);
  }

  onStatusChange(cb: (status: ConnectionStatus) => void): void {
    this.statusCallbacks.push(cb);
  }

  removeAllListeners(): void {
    if (this.connection) {
      for (const name of [
        'RoomMessage', 'UserMessage', 'EventCreated', 'EventUpdated',
        'EventDeleted', 'UserJoinedRoom', 'UserLeftRoom', 'RoomMembers',
        'UserOnline', 'UserOffline',
      ]) {
        this.connection.off(name);
      }
    }
    this.statusCallbacks = [];
  }

  on(eventName: string, cb: (data: unknown) => void): void {
    this.assertConnected();
    this.connection!.on(eventName, cb);
  }

  off(eventName: string): void {
    this.connection?.off(eventName);
  }

  private assertConnected(): void {
    if (!this.connection) throw new Error('SignalR not connected');
  }

  private updateStatus(status: ConnectionStatus): void {
    this.status = status;
    this.statusCallbacks.forEach((cb) => cb(status));
  }
}
