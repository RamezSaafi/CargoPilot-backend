import { IsString, IsNotEmpty, IsEmail, MaxLength } from 'class-validator';

export class CreateContactMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  message: string;
}