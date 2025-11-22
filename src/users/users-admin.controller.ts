import { Controller, Get, Post, Body, Patch, Param, UseGuards, ValidationPipe, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateSousAdminDto } from './dto/create-sous-admin.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserType, Utilisateur } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChangePasswordDto } from './dto/update-my-password.dto'; // <-- Import the renamed DTO

@Controller('admin/users')
@UseGuards(AuthGuard('jwt')) // All routes in this controller require a valid login
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserType.SousAdmin)
export class UsersAdminController {
  constructor(private readonly usersService: UsersService) {}

  // --- All ADMIN-ONLY routes are below ---
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post('sous-admin')
  createSousAdmin(@Body(new ValidationPipe()) createSousAdminDto: CreateSousAdminDto) {
    return this.usersService.createSousAdmin(createSousAdminDto);
  }

   @Patch(':id')
  update(@Param('id') id: string, @Body(new ValidationPipe()) updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/status')
  updateUserStatus(@Param('id') id: string, @Body(new ValidationPipe()) updateUserStatusDto: UpdateUserStatusDto) {
    return this.usersService.updateUserStatus(id, updateUserStatusDto);
  }


  // --- NEW, DEDICATED ENDPOINT FOR THE LOGGED-IN ADMIN ---
  /**
   * Endpoint for a logged-in SousAdmin to change their own password.
   * PATCH /admin/users/me/password
   */
  @Patch('me/password')
  updateMyPassword(
    @Request() req, // Get the user object from the request
    @Body(new ValidationPipe()) updateMyPasswordDto: ChangePasswordDto
  ) {
    const loggedInUser: Utilisateur = req.user; // `req.user` was attached by AuthGuard
    return this.usersService.updateMyPassword(loggedInUser, updateMyPasswordDto);
  }

  @Patch('me/upload-picture')
  @UseInterceptors(FileInterceptor('file'))
  uploadProfilePicture(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const loggedInUser: Utilisateur = req.user;
    return this.usersService.uploadProfilePicture(loggedInUser.id, file);
  }
}