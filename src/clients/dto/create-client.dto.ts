import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  contactName?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  status?: string; // e.g., "Processing", "Success"
}