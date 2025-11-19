import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateSousAdminDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;
  
  // We will handle roles later if needed, for now, we create a standard Sous-Admin.
}