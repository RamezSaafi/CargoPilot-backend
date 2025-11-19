import { IsOptional, IsEnum, IsInt, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { QueryDto } from '../../common/dto/query.dto';
import { MissionStatus } from '@prisma/client';

export class QueryMissionDto extends QueryDto {
  @IsEnum(MissionStatus)
  @IsOptional()
  status?: MissionStatus;

  @IsInt()
  @Type(() => Number)
  @IsOptional()
  clientId?: number;

  @IsInt()
  @Type(() => Number)
  @IsOptional()
  chauffeurId?: number;

  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @IsDateString()
  @IsOptional()
  dateTo?: string;
}