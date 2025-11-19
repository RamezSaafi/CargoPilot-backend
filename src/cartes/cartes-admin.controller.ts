import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ValidationPipe,
  Query
} from '@nestjs/common';
import { CartesService } from './cartes.service';
import { CreateCarteDto } from './dto/create-carte.dto';
import { UpdateCarteDto } from './dto/update-carte.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserType } from '@prisma/client';
import { QueryDto } from 'src/common/dto/query.dto';

@Controller('admin/cartes')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserType.SousAdmin)
export class CartesAdminController {
  constructor(private readonly cartesService: CartesService) {}

  @Post()
  create(@Body(new ValidationPipe({ transform: true })) createCarteDto: CreateCarteDto) {
    return this.cartesService.create(createCarteDto);
  }

  @Get()
  findAll(@Query(new ValidationPipe({ transform: true })) queryDto: QueryDto) {
    return this.cartesService.findAll(queryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cartesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body(new ValidationPipe({ transform: true })) updateCarteDto: UpdateCarteDto) {
    return this.cartesService.update(+id, updateCarteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cartesService.remove(+id);
  }
}