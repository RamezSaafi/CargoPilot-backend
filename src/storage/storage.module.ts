import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule], // Make SupabaseAdminClient available for injection
  providers: [StorageService],
  exports: [StorageService], // Export the service so other modules can use it
})
export class StorageModule {}