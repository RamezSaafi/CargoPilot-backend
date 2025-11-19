import { FactoryProvider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_ADMIN_CLIENT = 'SUPABASE_ADMIN_CLIENT';

export const SupabaseAdminProvider: FactoryProvider = {
  provide: SUPABASE_ADMIN_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): SupabaseClient => {
    const supabaseUrl = configService.get<string>('SUPABASE_URL');
    const supabaseServiceRoleKey = configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Supabase URL or Service Role Key is not defined.');
    }

    return createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  },
};