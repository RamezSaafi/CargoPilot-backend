import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardAdminController } from './dashboard-admin.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DashboardAdminController],
  providers: [DashboardService],
})
export class DashboardModule {}