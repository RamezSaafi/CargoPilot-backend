import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService], // This makes PrismaService available for injection
  exports: [PrismaService],   // This allows other modules to import and use PrismaService
})
export class PrismaModule {}