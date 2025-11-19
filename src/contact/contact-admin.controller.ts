import { Controller, Get, Patch, Body, Param, Delete, UseGuards, ValidationPipe, Query } from '@nestjs/common';
import { ContactService } from './contact.service';
import { UpdateMessageStatusDto } from './dto/update-message-status.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserType } from '@prisma/client';
import { QueryDto } from '../common/dto/query.dto';

@Controller('admin/contact')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserType.SousAdmin)
export class ContactAdminController {
  constructor(private readonly contactService: ContactService) {}

  /**
   * GET /admin/contact
   * Fetches all contact messages with pagination and search.
   */
  @Get()
  findAll(@Query(new ValidationPipe({ transform: true })) queryDto: QueryDto) {
    return this.contactService.findAllMessages(queryDto);
  }

  /**
   * PATCH /admin/contact/:id/status
   * Updates the status of a message (e.g., to "Lu").
   */
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body(new ValidationPipe()) updateDto: UpdateMessageStatusDto) {
    return this.contactService.updateMessageStatus(+id, updateDto.status);
  }

  /**
   * DELETE /admin/contact/:id
   * Deletes a contact message.
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contactService.deleteMessage(+id);
  }
}