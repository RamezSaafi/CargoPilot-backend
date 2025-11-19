import { Controller, Get, Param, UseGuards, Request, Patch, Body, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MissionsService } from './missions.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserType, Utilisateur } from '@prisma/client';
import { UpdateMissionStatusDto } from './dto/update-mission-status.dto';

@Controller('mobile/missions')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserType.Chauffeur)
export class MissionsMobileController {
  constructor(private readonly missionsService: MissionsService) {}

  @Get('my-active')
  findMyActiveMissions(@Request() req) {
    // The `req.user` object is the full 'Utilisateur' profile.
    // We need to get the related Chauffeur's ID.
    // NOTE: A robust solution would fetch the chauffeur profile first.
    // For now, we assume this info is available or can be fetched.
    // This highlights a potential area for improvement (e.g., adding chauffeurId to the JWT payload).
    
    // Let's assume we can get the chauffeur profile from the user ID.
    // A better approach would be to have a findChauffeurByUserId in the chauffeur service.
    const chauffeurId = req.user.chauffeur?.id; // Assuming chauffeur relation is loaded in JWTStrategy
    
    if (!chauffeurId) {
        // Handle case where user is not linked to a chauffeur profile
        return [];
    }

    return this.missionsService.findActiveMissionsForChauffeur(chauffeurId);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateDto: UpdateMissionStatusDto,
    @Request() req,
  ) {
    const loggedInUser: Utilisateur & { chauffeur: { id: number } } = req.user;
    const chauffeurId = loggedInUser.chauffeur.id;

    return this.missionsService.updateStatusByChauffeur(+id, chauffeurId, updateDto.status);
  }
  
}