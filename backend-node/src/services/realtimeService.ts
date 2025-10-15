import { Server as SocketIOServer } from 'socket.io';

/**
 * Service for emitting real-time events through Socket.IO
 * Used by controllers to broadcast events to connected clients
 */
export class RealtimeService {
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  /**
   * Emit user message event (direct message)
   */
  emitUserMessage(toUserId: string, data: any) {
    this.io.to(`user:${toUserId}`).emit('userMessage', data);
  }

  /**
   * Emit room message event
   */
  emitRoomMessage(roomId: string, data: any) {
    this.io.to(`room:${roomId}`).emit('roomMessage', data);
  }

  /**
   * Emit event created notification
   * - Public events: broadcast to all connected users
   * - Restricted events: emit to owner + allowed users + admins
   * - Private events: emit to owner only
   */
  emitEventCreated(event: any, createdBy: string) {
    if (event.visibility === 'public') {
      // Broadcast to all connected users
      this.io.emit('eventCreated', event);
    } else if (event.visibility === 'restricted') {
      // Emit to owner
      this.io.to(`user:${createdBy}`).emit('eventCreated', event);

      // Emit to allowed users
      if (event.allowedUserIds && Array.isArray(event.allowedUserIds)) {
        event.allowedUserIds.forEach((userId: string) => {
          this.io.to(`user:${userId}`).emit('eventCreated', event);
        });
      }
    } else {
      // Private: emit to owner only
      this.io.to(`user:${createdBy}`).emit('eventCreated', event);
    }
  }

  /**
   * Emit event updated notification
   */
  emitEventUpdated(event: any, createdBy: string) {
    if (event.visibility === 'public') {
      this.io.emit('eventUpdated', event);
    } else if (event.visibility === 'restricted') {
      this.io.to(`user:${createdBy}`).emit('eventUpdated', event);
      if (event.allowedUserIds && Array.isArray(event.allowedUserIds)) {
        event.allowedUserIds.forEach((userId: string) => {
          this.io.to(`user:${userId}`).emit('eventUpdated', event);
        });
      }
    } else {
      this.io.to(`user:${createdBy}`).emit('eventUpdated', event);
    }
  }

  /**
   * Emit event deleted notification
   */
  emitEventDeleted(eventId: string, event: any, createdBy: string) {
    const data = { id: eventId };

    if (event.visibility === 'public') {
      this.io.emit('eventDeleted', data);
    } else if (event.visibility === 'restricted') {
      this.io.to(`user:${createdBy}`).emit('eventDeleted', data);
      if (event.allowedUserIds && Array.isArray(event.allowedUserIds)) {
        event.allowedUserIds.forEach((userId: string) => {
          this.io.to(`user:${userId}`).emit('eventDeleted', data);
        });
      }
    } else {
      this.io.to(`user:${createdBy}`).emit('eventDeleted', data);
    }
  }
}

export default RealtimeService;
