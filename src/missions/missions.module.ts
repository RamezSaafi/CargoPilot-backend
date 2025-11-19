import { Module } from '@nestjs/common';
import { MissionsService } from './missions.service';
import { MissionsAdminController } from './missions-admin.controller';
import { MissionsMobileController } from './missions-mobile.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [PrismaModule,NotificationsModule],
  controllers: [MissionsAdminController, MissionsMobileController],
  providers: [MissionsService],
})
export class MissionsModule {}