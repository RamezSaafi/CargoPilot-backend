import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChauffeursService } from './chauffeurs.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserType, Utilisateur } from '@prisma/client';

// 1. SET THE ROUTE PREFIX FOR MOBILE
@Controller('mobile/chauffeurs')

// 2. APPLY GUARDS AT THE CONTROLLER LEVEL
@UseGuards(AuthGuard('jwt'), RolesGuard)

// 3. SET THE REQUIRED ROLE
// Only users with the 'Chauffeur' role can access these endpoints.
@Roles(UserType.Chauffeur)
export class ChauffeursMobileController {
  constructor(private readonly chauffeursService: ChauffeursService) {}

  /**
   * GET /mobile/chauffeurs/me
   * A dedicated endpoint for the chauffeur to get their own profile details.
   */
  @Get('me')
  getMyProfile(@Request() req) {
    // Our JwtStrategy attached the full user object to the request.
    // We can safely access it to get the logged-in user's ID.
    const loggedInUser: Utilisateur = req.user;

    // We call a specific service method to get the profile.
    // The service will use the user's ID to find the linked chauffeur profile.
    return this.chauffeursService.findChauffeurByUserId(loggedInUser.id);
  }
}