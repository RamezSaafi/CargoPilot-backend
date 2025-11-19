import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserType } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get the roles required to access this route from the @Roles decorator
    const requiredRoles = this.reflector.getAllAndOverride<UserType[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles) {
      return true;
    }

    // Get the user object from the request
    // This user object was attached by the JwtAuthGuard, which must run first.
    const { user } = context.switchToHttp().getRequest();

    // Check if the user's role is included in the list of required roles
    return requiredRoles.some((role) => user.userType?.includes(role));
  }
}