import { Controller, Get, Post, Body, Param, UseGuards, ValidationPipe, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserType } from '@prisma/client';
import { MissionsService } from './missions.service';
import { CreateMissionDto } from './dto/create-mission.dto';
import { QueryMissionDto } from './dto/query-mission.dto';


@Controller('admin/missions')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserType.SousAdmin)
export class MissionsAdminController {
  constructor(private readonly missionsService: MissionsService) {}

  @Post()
  create(@Body(new ValidationPipe()) createMissionDto: CreateMissionDto) {
    return this.missionsService.create(createMissionDto);
  }

  @Get()
  findAll(@Query(new ValidationPipe({ transform: true, whitelist: true })) queryDto: QueryMissionDto) { // <-- Use the new DTO
    return this.missionsService.findAll(queryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.missionsService.findOne(+id);
  }
}