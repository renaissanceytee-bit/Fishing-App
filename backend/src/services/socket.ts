import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export function setupSocketIO(io: Server) {
  // Authentication middleware
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Join conversation rooms
    socket.on('join-conversation', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
    });

    // Handle real-time messaging
    socket.on('send-message', async (data: {
      receiverId: string;
      content: string;
    }) => {
      try {
        const message = await prisma.message.create({
          data: {
            senderId: socket.userId!,
            receiverId: data.receiverId,
            content: data.content
          },
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          }
        });

        // Send to receiver
        io.to(`user:${data.receiverId}`).emit('new-message', message);
        
        // Confirm to sender
        socket.emit('message-sent', message);
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing-start', (receiverId: string) => {
      io.to(`user:${receiverId}`).emit('user-typing', {
        userId: socket.userId
      });
    });

    socket.on('typing-stop', (receiverId: string) => {
      io.to(`user:${receiverId}`).emit('user-stopped-typing', {
        userId: socket.userId
      });
    });

    // Handle location updates (for live fishing tracking)
    socket.on('update-location', async (data: {
      latitude: number;
      longitude: number;
    }) => {
      // Broadcast to followers
      const followers = await prisma.follow.findMany({
        where: { followingId: socket.userId },
        select: { followerId: true }
      });

      followers.forEach(follower => {
        io.to(`user:${follower.followerId}`).emit('follower-location-update', {
          userId: socket.userId,
          latitude: data.latitude,
          longitude: data.longitude
        });
      });
    });

    // Handle live stream events
    socket.on('start-stream', (data: {
      streamId: string;
      title: string;
    }) => {
      socket.join(`stream:${data.streamId}`);
      io.emit('stream-started', {
        streamId: data.streamId,
        userId: socket.userId,
        title: data.title
      });
    });

    socket.on('join-stream', (streamId: string) => {
      socket.join(`stream:${streamId}`);
    });

    socket.on('stream-message', (data: {
      streamId: string;
      message: string;
    }) => {
      io.to(`stream:${data.streamId}`).emit('stream-chat-message', {
        userId: socket.userId,
        message: data.message,
        timestamp: new Date()
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
}

// Utility function to send notifications
export async function sendNotification(io: Server, userId: string, notification: any) {
  io.to(`user:${userId}`).emit('notification', notification);
}

// Utility function to broadcast catch
export async function broadcastNewCatch(io: Server, catchId: string) {
  const catchData = await prisma.catch.findUnique({
    where: { id: catchId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatar: true
        }
      },
      species: true
    }
  });

  if (catchData && catchData.visibility === 'PUBLIC') {
    io.emit('new-catch', catchData);
  }
}
