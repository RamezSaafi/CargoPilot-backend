import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';

@Controller('contact') // The base path will be /contact
export class ContactPublicController {
  constructor(private readonly contactService: ContactService) {}

  /**
   * POST /contact
   * This is the public endpoint for the website's contact form.
   * No authentication is required.
   */
  @Post()
  submitMessage(@Body(new ValidationPipe()) createContactMessageDto: CreateContactMessageDto) {
    return this.contactService.createMessage(createContactMessageDto);
  }
}