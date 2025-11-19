import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { QueryDto } from '../common/dto/query.dto';
import { MessageStatus, Prisma } from '@prisma/client';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class ContactService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  /**
   * Called by the public controller to save a new message.
   */
  async createMessage(createDto: CreateContactMessageDto) {
    const newMessage = await this.prisma.contactMessage.create({
      data: createDto,
    });

    // 3. Define the data payload for the notification
    const notificationPayload = {
      id: newMessage.id,
      name: newMessage.name,
      message: newMessage.message.substring(0, 50) + '...', // Send a snippet
      createdAt: newMessage.createdAt,
    };

    // 4. Emit the event to the 'admins' room.
    this.notificationsGateway.sendToRoom(
      'admins',                   // The Room Name
      'new_contact_message',      // The Event Name
      notificationPayload,        // The Data Payload
    );

    return { message: 'Your message has been sent successfully.' };
  }

  /**
   * Called by the admin controller to get all messages.
   */
  async findAllMessages(queryDto: QueryDto) {
    const { search, page, limit } = queryDto;
    const skip = (page - 1) * limit;

    const where: Prisma.ContactMessageWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [messages, total] = await this.prisma.$transaction([
      this.prisma.contactMessage.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contactMessage.count({ where }),
    ]);
    
    return { data: messages, total, page, limit };
  }

  /**
   * Called by the admin controller to update a message's status.
   */
  async updateMessageStatus(id: number, status: MessageStatus) {
    // Check if message exists first
    const message = await this.prisma.contactMessage.findUnique({ where: { id } });
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found.`);
    }

    return this.prisma.contactMessage.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * Called by the admin controller to delete a message.
   */
  async deleteMessage(id: number) {
    // Check if message exists first
    const message = await this.prisma.contactMessage.findUnique({ where: { id } });
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found.`);
    }
    
    return this.prisma.contactMessage.delete({
      where: { id },
    });
  }
}