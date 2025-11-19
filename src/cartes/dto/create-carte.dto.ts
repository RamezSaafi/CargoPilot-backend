import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsInt } from 'class-validator';
import { CardType, CardStatus } from '@prisma/client';

export class CreateCarteDto {
  @IsString()
  @IsNotEmpty()
  cardNumber: string;

  @IsEnum(CardType)
  @IsNotEmpty()
  cardType: CardType;

  @IsEnum(CardStatus)
  @IsNotEmpty()
  status: CardStatus;

  @IsDateString()
  @IsOptional()
  expirationDate?: string;

  // When creating a card, we can optionally assign it to a chauffeur immediately.
  @IsInt()
  @IsOptional()
  chauffeurId?: number;
}