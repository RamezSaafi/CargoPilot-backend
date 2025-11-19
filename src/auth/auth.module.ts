import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt'; // <-- Import JwtModule
import { ConfigModule, ConfigService } from '@nestjs/config'; // <-- Import these
import { JwtStrategy } from './jwt.strategy';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // --- ADD THIS CONFIGURATION ---
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('SUPABASE_JWT_SECRET'),
        signOptions: { expiresIn: '1h' }, // Default expiration
      }),
      inject: [ConfigService],
    }),
    // -----------------------------
  ],
  providers: [JwtStrategy],
  exports: [PassportModule, JwtModule], // <-- EXPORT JwtModule
})
export class AuthModule {}