import { IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';
export class CreateEntretienDto {
  @IsString() @IsNotEmpty() typeEntretien: string;
  @IsDateString() @IsNotEmpty() dateEntretien: string;
  @IsDateString() @IsOptional() dateProchainEntretien?: string;
  @IsString() @IsOptional() notes?: string;
}