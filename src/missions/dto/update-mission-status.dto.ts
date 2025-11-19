import { IsEnum, IsNotEmpty } from 'class-validator';
import { MissionStatus } from '@prisma/client';

export class UpdateMissionStatusDto {
  @IsEnum(MissionStatus)
  @IsNotEmpty()
  status: MissionStatus;
}