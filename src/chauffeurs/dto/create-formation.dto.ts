import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateFormationDto {
  @IsString()
  @IsNotEmpty()
  formationName: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  dateCompleted?: string;
}