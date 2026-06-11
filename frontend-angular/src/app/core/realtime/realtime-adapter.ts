// Payload interfaces — copied verbatim from frontend-react/src/adapters/RealtimeAdapter.ts
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

export interface RoomMessageEvent {
  roomId: string;
  messageId: string;
  senderId: string;
  senderUsername: string;
  message: string;
  timestamp: string;
}

export interface UserMessageEvent {
  messageId: string;
  senderId: string;
  senderUsername: string;
  receiverId: string;
  message: string;
  timestamp: string;
}

export interface EventCreatedEvent {
  eventId: string;
  title: string;
  startTime: string;
  endTime: string;
  visibility: 'Private' | 'Public' | 'Restricted';
  createdBy: string;
}

export interface EventUpdatedEvent {
  eventId: string;
  title: string;
  startTime: string;
  endTime: string;
  visibility: 'Private' | 'Public' | 'Restricted';
}

export interface EventDeletedEvent {
  eventId: string;
}

export interface UserJoinedRoomEvent {
  roomId: string;
  userId: string;
  username: string;
}

export interface UserLeftRoomEvent {
  roomId: string;
  userId: string;
  username: string;
}

export interface UserOnlineEvent {
  userId: string;
}

export interface UserOfflineEvent {
  userId: string;
}

// Abstract class (not interface) so Angular DI can use it as a token
export abstract class RealtimeAdapter {
  abstract connect(accessToken: string): Promise<void>;
  abstract disconnect(): void;
  abstract getStatus(): ConnectionStatus;
  abstract joinRoom(roomId: string): Promise<void>;
  abstract leaveRoom(roomId: string): Promise<void>;
  abstract sendToRoom(roomId: string, message: string): Promise<void>;
  abstract onRoomMessage(callback: (event: RoomMessageEvent) => void): void;
  abstract onUserMessage(callback: (event: UserMessageEvent) => void): void;
  abstract onEventCreated(callback: (event: EventCreatedEvent) => void): void;
  abstract onEventUpdated(callback: (event: EventUpdatedEvent) => void): void;
  abstract onEventDeleted(callback: (event: EventDeletedEvent) => void): void;
  abstract onUserJoinedRoom(callback: (event: UserJoinedRoomEvent) => void): void;
  abstract onUserLeftRoom(callback: (event: UserLeftRoomEvent) => void): void;
  abstract onUserOnline(callback: (event: UserOnlineEvent) => void): void;
  abstract onUserOffline(callback: (event: UserOfflineEvent) => void): void;
  abstract onStatusChange(callback: (status: ConnectionStatus) => void): void;
  abstract removeAllListeners(): void;
  // Generic escape hatch (used by RoomsPage for 'roomMembers' event)
  abstract on(eventName: string, callback: (data: unknown) => void): void;
  abstract off(eventName: string): void;
}
