import { Module } from '@nestjs/common';
import { VehiculesService } from './vehicules.service';
import { VehiculesAdminController } from './vehicules-admin.controller';
import { VehiculesMobileController } from './vehicules-mobile.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  imports: [PrismaModule,StorageModule],
  controllers: [VehiculesAdminController, VehiculesMobileController],
  providers: [VehiculesService],
})
export class VehiculesModule {}