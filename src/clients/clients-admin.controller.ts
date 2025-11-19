import {
  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ValidationPipe,
  UseInterceptors, UploadedFile,Query
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserType } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { QueryDto } from 'src/common/dto/query.dto';

@Controller('admin/clients')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserType.SousAdmin)
export class ClientsAdminController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  create(@Body(new ValidationPipe()) createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  @Get()
  findAll(@Query(new ValidationPipe({ transform: true })) queryDto: QueryDto) {
    return this.clientsService.findAll(queryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body(new ValidationPipe()) updateClientDto: UpdateClientDto) {
    return this.clientsService.update(+id, updateClientDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientsService.remove(+id);
  }

  @Patch(':id/upload-picture')
  @UseInterceptors(FileInterceptor('file'))
  uploadProfilePicture(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.clientsService.uploadProfilePicture(+id, file);
  }
}