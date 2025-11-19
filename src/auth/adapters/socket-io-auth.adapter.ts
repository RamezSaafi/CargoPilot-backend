import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions, Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken'; // Use the standard jsonwebtoken library

// This is a simplified version of a JWT payload for our check
interface TokenPayload {
  sub: string;
}

export class AuthenticatedSocketIoAdapter extends IoAdapter {
  // The constructor now accepts the JWT secret directly
  constructor(private readonly jwtSecret: string) {
    super();
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server: Server = super.createIOServer(port, options);

    // This is our custom authentication middleware for Socket.IO
    server.use((socket: any, next) => {
      const token =
        socket.handshake.auth.token || socket.handshake.headers['authorization']?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication error: No token provided.'));
      }

      try {
        // Verify the token using the secret provided in the constructor
        const payload = jwt.verify(token, this.jwtSecret) as TokenPayload;
        // Attach the user's ID to the socket object for later use
        socket.userId = payload.sub;
        next();
      } catch (err) {
        return next(new Error('Authentication error: Invalid token.'));
      }
    });

    return server;
  }
}