import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { verifyToken } from '../utils/jwt';
import { User } from '../models';

// Track room members
const roomMembers = new Map<string, Set<{ userId: string; username: string; socketId: string }>>();

// Track online users (userId -> Set of socketIds for multi-device support)
const onlineUsers = new Map<string, Set<string>>();

/**
 * Socket.IO server configuration and initialization
 */
export function initializeSocketIO(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3001'],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket, next) => {
    try {
      // Get token from query string (for initial connection)
      const token = socket.handshake.auth.token || socket.handshake.query.token;

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify JWT token
      const decoded = verifyToken(token as string);

      // Attach user info to socket
      socket.data.user = decoded;

      next();
    } catch (error) {
      next(new Error('Invalid authentication token'));
    }
  });

  // Connection event handler
  io.on('connection', (socket) => {
    const user = socket.data.user;
    console.log(`✅ User connected: ${user.email} (${socket.id})`);

    // Join user to their personal room (for direct messages)
    socket.join(`user:${user.userId}`);

    // Track user as online
    if (!onlineUsers.has(user.userId)) {
      onlineUsers.set(user.userId, new Set());
      // User just came online, broadcast to all connected clients
      io.emit('userOnline', { userId: user.userId });
    }
    onlineUsers.get(user.userId)!.add(socket.id);

    // Handle room join
    socket.on('joinRoom', async (roomId: string) => {
      socket.join(`room:${roomId}`);

      // Get user details including username
      const userRecord = await User.findByPk(user.userId);
      const username = userRecord?.username || user.email;

      console.log(`👥 User ${username} joined room ${roomId}`);

      // Get existing members
      if (!roomMembers.has(roomId)) {
        roomMembers.set(roomId, new Set());
      }

      const existingMembers = Array.from(roomMembers.get(roomId)!).map(m => ({
        userId: m.userId,
        username: m.username,
      }));

      // Add new member
      roomMembers.get(roomId)!.add({
        userId: user.userId,
        username: username,
        socketId: socket.id,
      });

      // Send existing members to the new joiner
      socket.emit('roomMembers', {
        roomId,
        members: existingMembers,
      });

      // Notify other room members about the new joiner
      socket.to(`room:${roomId}`).emit('userJoinedRoom', {
        roomId,
        userId: user.userId,
        username: username,
      });
    });

    // Handle room leave
    socket.on('leaveRoom', async (roomId: string) => {
      socket.leave(`room:${roomId}`);

      // Get username
      const userRecord = await User.findByPk(user.userId);
      const username = userRecord?.username || user.email;

      console.log(`👋 User ${username} left room ${roomId}`);

      // Remove from tracking
      if (roomMembers.has(roomId)) {
        const members = roomMembers.get(roomId)!;
        for (const member of members) {
          if (member.socketId === socket.id) {
            members.delete(member);
            break;
          }
        }
        if (members.size === 0) {
          roomMembers.delete(roomId);
        }
      }

      // Notify room members
      socket.to(`room:${roomId}`).emit('userLeftRoom', {
        roomId,
        userId: user.userId,
        username: username,
      });
    });

    // Handle room message
    socket.on('sendToRoom', async (data: { roomId: string; message: string }) => {
      const { roomId, message } = data;

      // Get username
      const userRecord = await User.findByPk(user.userId);
      const username = userRecord?.username || user.email;

      // Broadcast to all users in the room
      io.to(`room:${roomId}`).emit('roomMessage', {
        roomId,
        messageId: `${Date.now()}-${Math.random()}`,
        senderId: user.userId,
        senderUsername: username,
        message,
        timestamp: new Date().toISOString(),
      });

      console.log(`💬 Message sent to room ${roomId} by ${username}`);
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`❌ User disconnected: ${user.email} (${socket.id})`);

      // Get username
      const userRecord = await User.findByPk(user.userId);
      const username = userRecord?.username || user.email;

      // Remove socket from online users tracking
      if (onlineUsers.has(user.userId)) {
        const userSockets = onlineUsers.get(user.userId)!;
        userSockets.delete(socket.id);

        // If user has no more active connections, mark as offline
        if (userSockets.size === 0) {
          onlineUsers.delete(user.userId);
          // Broadcast user offline to all connected clients
          io.emit('userOffline', { userId: user.userId });
        }
      }

      // Remove user from all rooms they were in
      for (const [roomId, members] of roomMembers.entries()) {
        for (const member of members) {
          if (member.socketId === socket.id) {
            members.delete(member);
            console.log(`👋 User ${username} removed from room ${roomId} due to disconnect`);

            // Notify other room members
            socket.to(`room:${roomId}`).emit('userLeftRoom', {
              roomId,
              userId: user.userId,
              username: username,
            });

            if (members.size === 0) {
              roomMembers.delete(roomId);
            }
            break;
          }
        }
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`🔴 Socket error for ${user.email}:`, error);
    });
  });

  console.log('✅ Socket.IO server initialized');
  return io;
}

export default initializeSocketIO;
