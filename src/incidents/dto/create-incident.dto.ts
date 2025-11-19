import { IsString, IsNotEmpty, IsOptional, IsDateString, IsInt } from 'class-validator';

export class CreateIncidentDto {
  @IsString()
  @IsNotEmpty()
  incidentType: string; // e.g., "Infraction", "Accident", "Maintenance"

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  // An incident might be linked to a specific mission. This is optional.
  @IsInt()
  @IsOptional()
  missionId?: number;

  // A file (like a photo of the incident) would be handled by a separate upload endpoint.
}