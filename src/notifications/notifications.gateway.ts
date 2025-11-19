import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; // Import Prisma

interface AuthenticatedSocket extends Socket {
  userId: string;
}

@WebSocketGateway({
  cors: {
    origin: '*', // Allow connections from any origin (adjust for production)
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  // @WebSocketServer() gives us access to the underlying socket.io server instance.
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * This method is called automatically when a new client connects.
   */
   async handleConnection(client: AuthenticatedSocket) {
    const userId = client.userId; // This UUID was attached by our custom adapter.
    this.logger.log(`Authenticated client connected: ${client.id}, UserID: ${userId}`);

    try {
      // 1. Fetch the user's full profile from our database.
      // This is our single source of truth for their role and status.
      const user = await this.prisma.utilisateur.findUnique({
        where: { id: userId },
      });

      // 2. Validate the user.
      if (!user) {
        this.logger.warn(`User profile not found in database for ID: ${userId}. Disconnecting socket.`);
        client.disconnect();
        return;
      }

      if (user.status === 'Inactif') {
        this.logger.warn(`Inactive user tried to connect: ${user.email} (ID: ${userId}). Disconnecting socket.`);
        client.disconnect();
        return;
      }

      // --- 3. ROOM MANAGEMENT LOGIC ---

      // a) Every user joins their own private, personal room.
      // This allows us to send a notification specifically to this user.
      // Room name is their unique ID.
      client.join(userId);
      this.logger.log(`Client ${client.id} joined personal room: "${userId}"`);

      // b) If the user is a SousAdmin, they ALSO join the global 'admins' room.
      // This allows us to broadcast a notification to all connected admins at once.
      if (user.userType === 'SousAdmin') {
        client.join('admins');
        this.logger.log(`Client ${client.id} (Admin) also joined global room: 'admins'`);
      }

      // c) If the user is a Chauffeur, we can add them to a 'chauffeurs' room if needed.
      if (user.userType === 'Chauffeur') {
        client.join('chauffeurs');
        this.logger.log(`Client ${client.id} (Chauffeur) also joined global room: 'chauffeurs'`);
      }

    } catch (error) {
      this.logger.error(`Error during handleConnection for client ${client.id}:`, error);
      client.disconnect();
    }
  }

  /**
   * This method is called automatically when a client disconnects.
   */
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * A generic method to send a notification to a specific "room".
   * For example, a room could be 'admins' or 'chauffeur-123'.
   *
   * @param room The name of the room to send the event to.
   * @param event The name of the event (e.g., 'new_mission').
   * @param data The payload to send with the event.
   */
  sendToRoom(room: string, event: string, data: any) {
    this.server.to(room).emit(event, data);
    this.logger.log(`Emitted event '${event}' to room '${room}'`);
  }
}