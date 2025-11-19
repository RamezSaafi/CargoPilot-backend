import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsDateString,
  IsBoolean
} from 'class-validator';

export class CreateChauffeurDto {
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required.' })
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  password: string; // The initial password set by the Sous-Admin

  @IsString()
  @IsNotEmpty({ message: 'Full name is required.' })
  fullName: string;

  @IsString()
  @IsNotEmpty({ message: 'Chauffeur code is required.' })
  chauffeurCode: string;

  // --- Optional Fields ---

  @IsDateString({}, { message: 'Birth date must be a valid date string (e.g., YYYY-MM-DD).' })
  @IsOptional()
  birthDate?: string; // Use string for dates in DTOs for easier JSON handling

  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @IsString()
  @IsOptional()
  licenseCategory?: string;

  @IsString()
  @IsOptional()
  contractType?: string;

  @IsBoolean()
  @IsOptional()
  activerAccesMobile?: boolean;

  // You can continue to add any other optional fields from your `Chauffeur` Prisma model here
}