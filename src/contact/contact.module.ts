import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactPublicController } from './contact-public.controller';
import { ContactAdminController } from './contact-admin.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule,NotificationsModule], // Add EmailModule here if you use it
  controllers: [ContactPublicController, ContactAdminController],
  providers: [ContactService],
})
export class ContactModule {}