import { IsString, IsDateString, IsOptional } from 'class-validator';
export class UpdateEntretienDto {
  @IsString() @IsOptional() typeEntretien?: string;
  @IsDateString() @IsOptional() dateEntretien?: string;
  @IsDateString() @IsOptional() dateProchainEntretien?: string;
  @IsString() @IsOptional() notes?: string;
}