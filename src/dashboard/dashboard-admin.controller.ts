import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserType } from '@prisma/client';
import { DashboardService } from './dashboard.service';

@Controller('admin/dashboard')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserType.SousAdmin)
export class DashboardAdminController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * GET /admin/dashboard/analytics
   * The single endpoint to fetch all data needed for the main dashboard page.
   */
  @Get('analytics')
  getDashboardAnalytics() {
    return this.dashboardService.getDashboardAnalytics();
  }
}