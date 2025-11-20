import { Controller, Post, Patch, Body, Get, UseGuards, Param, ValidationPipe, Query, UseInterceptors, UploadedFile, Delete  } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChauffeursService } from './chauffeurs.service';
import { CreateChauffeurDto } from './dto/create-chauffeur.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserType } from '@prisma/client';
import { QueryDto } from '../common/dto/query.dto';
import { CreateFormationDto } from './dto/create-formation.dto';
import { CreateIncidentDto } from '../incidents/dto/create-incident.dto';
import { FileInterceptor } from '@nestjs/platform-express';

// 1. CHANGE THE ROUTE PREFIX
// All routes for admin actions on chauffeurs will now start with '/admin/chauffeurs'
@Controller('admin/chauffeurs')

// 2. APPLY GUARDS AT THE CONTROLLER LEVEL
// This protects every single route defined in this file.
@UseGuards(AuthGuard('jwt'), RolesGuard)

// 3. SET THE REQUIRED ROLE
// Only users with the 'SousAdmin' role can access these endpoints.
@Roles(UserType.SousAdmin)
export class ChauffeursAdminController { // <-- 4. RENAME THE CLASS
  constructor(private readonly chauffeursService: ChauffeursService) {}

  /**
   * POST /admin/chauffeurs
   * Creates a new chauffeur. This is an admin-only action.
   */
  @Post()
  create(@Body() createChauffeurDto: CreateChauffeurDto) {
    return this.chauffeursService.create(createChauffeurDto);
  }

  /**
   * GET /admin/chauffeurs
   * Gets a list of ALL chauffeurs for the dashboard view.
   */
  @Get()
  findAll(@Query(new ValidationPipe({ transform: true })) queryDto: QueryDto) {
    return this.chauffeursService.findAll(queryDto);
  }

  /**
   * GET /admin/chauffeurs/:id
   * Gets detailed information for a single chauffeur for the admin view.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    // The '+' prefix is a shorthand to convert the string param to a number
    return this.chauffeursService.findOne(+id);
  }

  // You will add @Patch(':id') and @Delete(':id') methods here later for updating and deleting.

  @Post(':id/formations')
addFormation(
    @Param('id') id: string,
    @Body(new ValidationPipe()) createFormationDto: CreateFormationDto
) {
    return this.chauffeursService.addFormation(+id, createFormationDto);
}

/**
 * POST /admin/chauffeurs/:id/incidents
 * Adds an incident record to a chauffeur.
 */
@Post(':id/incidents')
addIncident(
    @Param('id') id: string,
    @Body(new ValidationPipe()) createIncidentDto: CreateIncidentDto
) {
    return this.chauffeursService.addIncident(+id, createIncidentDto);
}

/**
 * PATCH /admin/chauffeurs/:id/upload-document
 * Uploads a legal document (e.g., license, ID card).
 */
@Patch(':id/upload-document')
  @UseInterceptors(FileInterceptor('file'))
  uploadDocument(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('documentType') documentType: string,
    // Add this line to accept the optional expiration date from the form-data body
    @Body('expirationDate') expirationDate?: string,
  ) {
    // Pass the expirationDate to the service method
    return this.chauffeursService.uploadDocument(+id, file, documentType, expirationDate);
  }

/**
 * GET /admin/chauffeurs/document/:docId/view
 * Gets a temporary URL to view a private document.
 */
@Get('document/:docId/view')
getDocumentUrl(@Param('docId') docId: string) {
    return this.chauffeursService.getDocumentUrl(+docId);
}

@Delete(':id')
  remove(@Param('id') id: string) {
    return this.chauffeursService.remove(+id);
  }

}
