import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';

// This defines the structure of the data encoded in the Supabase JWT.
type JwtPayload = {
  sub: string; // 'sub' is the standard JWT claim for "subject", which is the user's ID (UUID)
  email: string;
  // You can add more properties here if you add them to your Supabase JWT via hooks/triggers
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly prisma: PrismaService, // Inject Prisma to fetch user details
    configService: ConfigService,
  ) {
    const jwtSecret = configService.get<string>('SUPABASE_JWT_SECRET');

    if (!jwtSecret) {
      throw new Error('JWT secret is not defined in environment variables.');
    }

    super({
      // This configures the strategy to look for the JWT in the standard
      // 'Authorization: Bearer <token>' header.
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // This ensures that the strategy does not accept expired tokens.
      ignoreExpiration: false,
      // This is the secret key used to sign and verify the tokens.
      secretOrKey: jwtSecret,
    });
  }

  /**
   * This method is automatically called by Passport after it has successfully
   * verified the token's signature. The return value of this method is what
   * NestJS will attach to the Request object as `req.user`.
   * @param payload The decoded JWT payload
   */
  async validate(payload: JwtPayload) {
    const user = await this.prisma.utilisateur.findUnique({
      where: { id: payload.sub },
      // THIS IS THE IMPORTANT PART:
      include: {
        chauffeur: {
            select: { id: true } // We only need the chauffeur's ID
        },
      },
    });

    if (!user || user.status === 'Inactif') {
      throw new UnauthorizedException('User is inactive or not found.');
    }

    return user;
  }
}