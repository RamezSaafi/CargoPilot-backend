import {
  Controller, Get, Post, Body, Param, UseGuards, Patch, Delete,
  UseInterceptors, UploadedFile, ValidationPipe, Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserType } from '@prisma/client';
import { VehiculesService } from './vehicules.service';
import { CreateVehiculeDto } from './dto/create-vehicule.dto';
import { UpdateVehiculeDto } from './dto/update-vehicule.dto';
import { CreateEntretienDto } from './dto/create-entretien.dto';
import { UpdateEntretienDto } from './dto/update-entretien.dto';
import { QueryDto } from '../common/dto/query.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('admin/vehicules')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserType.SousAdmin)
export class VehiculesAdminController {
  constructor(private readonly vehiculesService: VehiculesService) {}

  @Post()
  create(@Body(new ValidationPipe({ transform: true })) createVehiculeDto: CreateVehiculeDto) {
    return this.vehiculesService.create(createVehiculeDto);
  }

  @Get()
  findAll(@Query(new ValidationPipe({ transform: true })) queryDto: QueryDto) {
    return this.vehiculesService.findAll(queryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehiculesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body(new ValidationPipe({ transform: true })) updateVehiculeDto: UpdateVehiculeDto) {
    return this.vehiculesService.update(+id, updateVehiculeDto);
  }

  @Patch(':id/upload-photo')
  @UseInterceptors(FileInterceptor('file'))
  uploadPhoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.vehiculesService.uploadPhoto(+id, file);
  }

  @Post(':id/entretiens')
  addEntretien(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true })) createEntretienDto: CreateEntretienDto,
  ) {
    return this.vehiculesService.addEntretien(+id, createEntretienDto);
  }

  @Patch('entretiens/:entretienId')
  updateEntretien(
    @Param('entretienId') entretienId: string,
    @Body(new ValidationPipe({ transform: true })) updateEntretienDto: UpdateEntretienDto,
  ) {
    return this.vehiculesService.updateEntretien(+entretienId, updateEntretienDto);
  }

  @Delete('entretiens/:entretienId')
  removeEntretien(@Param('entretienId') entretienId: string) {
    return this.vehiculesService.removeEntretien(+entretienId);
  }
}