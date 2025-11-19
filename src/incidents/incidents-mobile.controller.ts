import { Controller, Post, Body, UseGuards, Request, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserType, Utilisateur } from '@prisma/client';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './dto/create-incident.dto';

@Controller('mobile/incidents')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserType.Chauffeur)
export class IncidentsMobileController {
  constructor(private readonly incidentsService: IncidentsService) {}

  /**
   * POST /mobile/incidents
   * Allows the logged-in chauffeur to report a new incident.
   */
  @Post()
  reportIncident(
    @Body(new ValidationPipe()) createIncidentDto: CreateIncidentDto,
    @Request() req,
  ) {
    const loggedInUser: Utilisateur & { chauffeur: { id: number } } = req.user;
    const chauffeurId = loggedInUser.chauffeur.id;

    return this.incidentsService.createIncidentByChauffeur(chauffeurId, createIncidentDto);
  }
}