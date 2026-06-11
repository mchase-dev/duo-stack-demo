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

/**
 * Abstract RealtimeAdapter interface
 */
export interface RealtimeAdapter {
  /**
   * Connect to the real-time server
   * @param accessToken JWT access token for authentication
   */
  connect(accessToken: string): Promise<void>;

  /**
   * Disconnect from the real-time server
   */
  disconnect(): void;

  /**
   * Get current connection status
   */
  getStatus(): ConnectionStatus;

  /**
   * Join a chat room
   * @param roomId Room ID to join
   */
  joinRoom(roomId: string): Promise<void>;

  /**
   * Leave a chat room
   * @param roomId Room ID to leave
   */
  leaveRoom(roomId: string): Promise<void>;

  /**
   * Send a message to a room
   * @param roomId Room ID
   * @param message Message content
   */
  sendToRoom(roomId: string, message: string): Promise<void>;

  /**
   * Listen for room messages
   * @param callback Callback function for room messages
   */
  onRoomMessage(callback: (event: RoomMessageEvent) => void): void;

  /**
   * Listen for direct user messages
   * @param callback Callback function for user messages
   */
  onUserMessage(callback: (event: UserMessageEvent) => void): void;

  /**
   * Listen for event created notifications
   * @param callback Callback function for event created
   */
  onEventCreated(callback: (event: EventCreatedEvent) => void): void;

  /**
   * Listen for event updated notifications
   * @param callback Callback function for event updated
   */
  onEventUpdated(callback: (event: EventUpdatedEvent) => void): void;

  /**
   * Listen for event deleted notifications
   * @param callback Callback function for event deleted
   */
  onEventDeleted(callback: (event: EventDeletedEvent) => void): void;

  /**
   * Listen for user joined room notifications
   * @param callback Callback function for user joined
   */
  onUserJoinedRoom(callback: (event: UserJoinedRoomEvent) => void): void;

  /**
   * Listen for user left room notifications
   * @param callback Callback function for user left
   */
  onUserLeftRoom(callback: (event: UserLeftRoomEvent) => void): void;

  /**
   * Listen for user online notifications
   * @param callback Callback function for user online
   */
  onUserOnline(callback: (event: UserOnlineEvent) => void): void;

  /**
   * Listen for user offline notifications
   * @param callback Callback function for user offline
   */
  onUserOffline(callback: (event: UserOfflineEvent) => void): void;

  /**
   * Listen for connection status changes
   * @param callback Callback function for status changes
   */
  onStatusChange(callback: (status: ConnectionStatus) => void): void;

  /**
   * Remove all event listeners (cleanup)
   */
  removeAllListeners(): void;

  /**
   * Generic event listener for any event type
   * @param eventName Name of the event to listen for
   * @param callback Callback function for the event
   */
  on(eventName: string, callback: (data: any) => void): void;

  /**
   * Remove a specific event listener
   * @param eventName Name of the event to remove listener for
   */
  off(eventName: string): void;
}
