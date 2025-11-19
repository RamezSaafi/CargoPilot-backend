import { Module } from '@nestjs/common';
import { CartesService } from './cartes.service';
import { CartesAdminController } from './cartes-admin.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CartesAdminController],
  providers: [CartesService],
})
export class CartesModule {}