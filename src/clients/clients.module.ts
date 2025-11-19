import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsAdminController } from './clients-admin.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [PrismaModule, StorageModule], // StorageModule is needed for uploads
  controllers: [ClientsAdminController],
  providers: [ClientsService],
})
export class ClientsModule {}