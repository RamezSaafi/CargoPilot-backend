import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { PrismaModule } from '../../prisma/prisma.module'; // <-- Import PrismaModule

@Module({
  imports: [PrismaModule], // <-- Add it here
  providers: [NotificationsGateway],
  exports: [NotificationsGateway],
})
export class NotificationsModule {}