import { IsString, IsNotEmpty, IsOptional, IsInt, IsDateString, IsEnum } from 'class-validator';
import { EtatVehicule } from '@prisma/client';

export class CreateVehiculeDto {
  @IsString() @IsNotEmpty() immatriculation: string;
  @IsString() @IsOptional() marque?: string;
  @IsString() @IsOptional() typeVehicule?: string;
  @IsInt() @IsOptional() anneeFabrication?: number;
  @IsInt() @IsOptional() kilometrageActuel?: number;
  @IsInt() @IsOptional() nombrePlaces?: number;
  @IsDateString() @IsOptional() dateMiseCirculation?: string;
  
  @IsEnum(EtatVehicule)
  @IsOptional()
  etatActuel?: EtatVehicule;

  @IsInt()
  @IsOptional()
  chauffeurActuelId?: number;

  @IsDateString()
  @IsOptional()
  dateAffectationActuelle?: string;

  @IsString()
  @IsOptional()
  utilisationPrevue?: string;

  @IsString()
  @IsOptional()
  remarques?: string;
}