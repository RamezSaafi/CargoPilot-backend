import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserType } from '@prisma/client';
import { VehiculesService } from './vehicules.service';

@Controller('mobile/vehicules')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserType.Chauffeur)
export class VehiculesMobileController {
  constructor(private readonly vehiculesService: VehiculesService) {}

  // Example endpoint: A chauffeur might need to see the details of the vehicle
  // they are currently assigned to. We can add this logic later if needed.
  // @Get('my-vehicle')
  // getMyVehicle(@Request() req) {
  //   const userId = req.user.id;
  //   // return this.vehiculesService.findVehicleForChauffeur(userId);
  // }
}