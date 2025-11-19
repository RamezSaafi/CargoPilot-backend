import { IsString, IsNotEmpty, IsOptional, IsInt, IsDateString, IsEnum, IsNumber } from 'class-validator';
import { MissionType, MissionStatus, ChargementType } from '@prisma/client';

export class CreateMissionDto {
  @IsString() @IsNotEmpty() missionCode: string;
  @IsEnum(MissionType) @IsNotEmpty() missionType: MissionType;
  @IsEnum(ChargementType) @IsOptional() chargementType?: ChargementType;
  @IsEnum(MissionStatus) @IsNotEmpty() status: MissionStatus;
  
  @IsInt() @IsNotEmpty() clientId: number;

  @IsDateString() @IsOptional() dateDepart?: string;
  @IsString() @IsOptional() heurePresenceObligatoire?: string; // format "HH:mm"
  @IsString() @IsOptional() heureDepartEstimee?: string;
  @IsDateString() @IsOptional() dateArriveeEstimee?: string;
  @IsString() @IsOptional() heureArriveeEstimee?: string;

  @IsString() @IsOptional() lieuDepart?: string;
  @IsString() @IsOptional() lieuArrivee?: string;
  @IsNumber() @IsOptional() distanceEstimeeKm?: number;

  @IsInt() @IsNotEmpty() chauffeurDepartId: number;
  @IsInt() @IsOptional() chauffeurArriveeId?: number;
  
  @IsInt() @IsNotEmpty() vehiculeDepartId: number;
  @IsInt() @IsOptional() vehiculeArriveeId?: number;
}