import { Module } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { IncidentsMobileController } from './incidents-mobile.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module'; // <-- Import

@Module({
  imports: [PrismaModule, NotificationsModule], // <-- Add it here
  controllers: [IncidentsMobileController],
  providers: [IncidentsService],
})
export class IncidentsModule {}