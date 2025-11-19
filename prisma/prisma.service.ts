import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  // This method is automatically called by NestJS once the module has been initialized.
  async onModuleInit() {
    // Here, we explicitly connect to the database.
    await this.$connect();
  }

  // This is a best practice for gracefully shutting down the application.
  // It ensures that Prisma disconnects from the database when the app closes.
  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}