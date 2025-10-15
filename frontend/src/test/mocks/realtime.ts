/**
 * Realtime Adapter Mocks
 * Mock implementations for testing real-time functionality
 */

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
  UserOfflineEvent,
  UserOnlineEvent,
} from '../../adapters/RealtimeAdapter';

export class MockRealtimeAdapter implements RealtimeAdapter {
  onUserOnline(callback: (event: UserOnlineEvent) => void): void {
    throw new Error('Method not implemented.');
  }
  onUserOffline(callback: (event: UserOfflineEvent) => void): void {
    throw new Error('Method not implemented.');
  }
  on(eventName: string, callback: (data: unknown) => void): void {
    throw new Error('Method not implemented.');
  }
  off(eventName: string): void {
    throw new Error('Method not implemented.');
  }
  private status: ConnectionStatus = 'disconnected';
  private roomMessageCallbacks: Array<(event: RoomMessageEvent) => void> = [];
  private userMessageCallbacks: Array<(event: UserMessageEvent) => void> = [];
  private eventCreatedCallbacks: Array<(event: EventCreatedEvent) => void> = [];
  private eventUpdatedCallbacks: Array<(event: EventUpdatedEvent) => void> = [];
  private eventDeletedCallbacks: Array<(event: EventDeletedEvent) => void> = [];
  private userJoinedCallbacks: Array<(event: UserJoinedRoomEvent) => void> = [];
  private userLeftCallbacks: Array<(event: UserLeftRoomEvent) => void> = [];
  private statusCallbacks: Array<(status: ConnectionStatus) => void> = [];

  async connect(_accessToken: string): Promise<void> {
    this.status = 'connected';
    this.statusCallbacks.forEach((cb) => cb('connected'));
  }

  disconnect(): void {
    this.status = 'disconnected';
    this.statusCallbacks.forEach((cb) => cb('disconnected'));
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  async joinRoom(_roomId: string): Promise<void> {
    // Mock implementation
  }

  async leaveRoom(_roomId: string): Promise<void> {
    // Mock implementation
  }

  async sendToRoom(_roomId: string, _message: string): Promise<void> {
    // Mock implementation
  }

  onRoomMessage(callback: (event: RoomMessageEvent) => void): void {
    this.roomMessageCallbacks.push(callback);
  }

  onUserMessage(callback: (event: UserMessageEvent) => void): void {
    this.userMessageCallbacks.push(callback);
  }

  onEventCreated(callback: (event: EventCreatedEvent) => void): void {
    this.eventCreatedCallbacks.push(callback);
  }

  onEventUpdated(callback: (event: EventUpdatedEvent) => void): void {
    this.eventUpdatedCallbacks.push(callback);
  }

  onEventDeleted(callback: (event: EventDeletedEvent) => void): void {
    this.eventDeletedCallbacks.push(callback);
  }

  onUserJoinedRoom(callback: (event: UserJoinedRoomEvent) => void): void {
    this.userJoinedCallbacks.push(callback);
  }

  onUserLeftRoom(callback: (event: UserLeftRoomEvent) => void): void {
    this.userLeftCallbacks.push(callback);
  }

  onStatusChange(callback: (status: ConnectionStatus) => void): void {
    this.statusCallbacks.push(callback);
  }

  removeAllListeners(): void {
    this.roomMessageCallbacks = [];
    this.userMessageCallbacks = [];
    this.eventCreatedCallbacks = [];
    this.eventUpdatedCallbacks = [];
    this.eventDeletedCallbacks = [];
    this.userJoinedCallbacks = [];
    this.userLeftCallbacks = [];
    this.statusCallbacks = [];
  }

  // Test helpers
  simulateRoomMessage(event: RoomMessageEvent): void {
    this.roomMessageCallbacks.forEach((cb) => cb(event));
  }

  simulateUserMessage(event: UserMessageEvent): void {
    this.userMessageCallbacks.forEach((cb) => cb(event));
  }

  simulateEventCreated(event: EventCreatedEvent): void {
    this.eventCreatedCallbacks.forEach((cb) => cb(event));
  }

  simulateEventUpdated(event: EventUpdatedEvent): void {
    this.eventUpdatedCallbacks.forEach((cb) => cb(event));
  }

  simulateEventDeleted(event: EventDeletedEvent): void {
    this.eventDeletedCallbacks.forEach((cb) => cb(event));
  }
}
