import { IsString, IsOptional, IsInt, IsDateString, IsEnum } from 'class-validator';
import { EtatVehicule } from '@prisma/client';

// For updates, all fields are optional.
export class UpdateVehiculeDto {
  @IsString() @IsOptional() immatriculation?: string;
  @IsString() @IsOptional() marque?: string;
  @IsString() @IsOptional() typeVehicule?: string;
  @IsInt() @IsOptional() anneeFabrication?: number;
  @IsInt() @IsOptional() kilometrageActuel?: number;
  @IsInt() @IsOptional() nombrePlaces?: number;
  @IsDateString() @IsOptional() dateMiseCirculation?: string;
  @IsEnum(EtatVehicule) @IsOptional() etatActuel?: EtatVehicule;
  @IsInt() @IsOptional() chauffeurActuelId?: number | null;
  @IsDateString() @IsOptional() dateAffectationActuelle?: string;
  @IsString() @IsOptional() utilisationPrevue?: string;
  @IsString() @IsOptional() remarques?: string;
}