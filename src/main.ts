import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from '../prisma/prisma.service';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AuthenticatedSocketIoAdapter } from './auth/adapters/socket-io-auth.adapter';
import { ConfigService } from '@nestjs/config'; // <-- Import ConfigService

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- START of WebSocket Adapter Configuration ---

  // 1. Get the ConfigService from the fully initialized app
  const configService = app.get(ConfigService);
  
  // 2. Retrieve the JWT secret
  const jwtSecret = configService.get<string>('SUPABASE_JWT_SECRET');
  if (!jwtSecret) {
    throw new Error('SUPABASE_JWT_SECRET is not defined in environment variables.');
  }

  // 3. Pass the secret directly to our new adapter
  app.useWebSocketAdapter(new AuthenticatedSocketIoAdapter(jwtSecret));

  // --- END of WebSocket Adapter Configuration ---


  // --- All other configurations remain the same ---
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const config = new DocumentBuilder()
    .setTitle('CargoPilot API')
    // ...
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  await app.listen(3000);
}
bootstrap();