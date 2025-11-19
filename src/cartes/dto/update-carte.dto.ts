import { IsString, IsOptional, IsEnum, IsDateString, IsInt } from 'class-validator';
import { CardType, CardStatus } from '@prisma/client';

// For updates, all fields are optional.
export class UpdateCarteDto {
  @IsString()
  @IsOptional()
  cardNumber?: string;

  @IsEnum(CardType)
  @IsOptional()
  cardType?: CardType;

  @IsEnum(CardStatus)
  @IsOptional()
  status?: CardStatus;

  @IsDateString()
  @IsOptional()
  expirationDate?: string;

  // We can update the assignment to a new chauffeur, or unassign it by sending null.
  @IsInt()
  @IsOptional()
  chauffeurId?: number | null;
}