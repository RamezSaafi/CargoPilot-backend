import { IsEnum, IsNotEmpty } from 'class-validator';
import { Status } from '@prisma/client';

export class UpdateUserStatusDto {
  @IsEnum(Status)
  @IsNotEmpty()
  status: Status; // 'Actif' or 'Inactif'
}