import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersAdminController } from './users-admin.controller';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { PrismaModule } from 'prisma/prisma.module';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  imports: [SupabaseModule,PrismaModule,StorageModule],
  providers: [UsersService],
  controllers: [UsersAdminController]
})
export class UsersModule {}
