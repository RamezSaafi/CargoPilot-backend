import { Module } from '@nestjs/common';
import { ChauffeursAdminController } from './chauffeurs-admin.controller';
import { ChauffeursMobileController } from './chauffeurs-mobile.controller';
import { ChauffeursService } from './chauffeurs.service';
import { PrismaModule } from '../../prisma/prisma.module';
import {SupabaseModule} from '../supabase/supabase.module';
import { EmailModule } from '../email/email.module';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  imports: [PrismaModule,SupabaseModule,EmailModule,StorageModule],
  controllers: [ChauffeursAdminController,ChauffeursMobileController],
  providers: [ChauffeursService]
})
export class ChauffeursModule {}
