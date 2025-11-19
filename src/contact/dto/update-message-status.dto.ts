import { IsEnum, IsNotEmpty } from 'class-validator';
import { MessageStatus } from '@prisma/client';

export class UpdateMessageStatusDto {
  @IsEnum(MessageStatus)
  @IsNotEmpty()
  status: MessageStatus; // "Nouveau" or "Lu"
}