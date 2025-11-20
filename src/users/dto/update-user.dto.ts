import { IsString, IsOptional, IsEmail } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  // We usually don't allow updating Email directly here as it's linked to Auth, 
  // but if you want to allow it, uncomment below:
  // @IsEmail()
  // @IsOptional()
  // email?: string;
}