import { Inject, Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SupabaseClient, createClient } from '@supabase/supabase-js';import { SUPABASE_ADMIN_CLIENT } from '../supabase/supabase-admin.provider';
import { CreateSousAdminDto } from './dto/create-sous-admin.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { ChangePasswordDto } from './dto/update-my-password.dto';
import { Status, Utilisateur } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(SUPABASE_ADMIN_CLIENT) private readonly supabaseAdmin: SupabaseClient,
  ) {}

  /**
   * Finds all users for the admin list view.
   */
  async findAll() {
    return this.prisma.utilisateur.findMany({
      orderBy: { fullName: 'asc' },
    });
  }

  /**
   * Creates a new Sous-Admin user.
   */
  async createSousAdmin(createSousAdminDto: CreateSousAdminDto) {
    // Step 1: Create user in Supabase Auth
    const { data: authData, error: authError } = await this.supabaseAdmin.auth.admin.createUser({
      email: createSousAdminDto.email,
      password: createSousAdminDto.password,
      email_confirm: true,
    });

    if (authError) { throw new BadRequestException(`Supabase Auth Error: ${authError.message}`); }

    // Step 2: Create user profile in Prisma
    try {
      return await this.prisma.utilisateur.create({
        data: {
          id: authData.user.id,
          email: createSousAdminDto.email,
          fullName: createSousAdminDto.fullName,
          userType: 'SousAdmin',
        },
      });
    } catch (dbError) {
      await this.supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw new BadRequestException(`Database Error: ${dbError.message}`);
    }
  }

  /**
   * Updates a user's status (Actif/Inactif).
   */
  async updateUserStatus(userId: string, updateUserStatusDto: UpdateUserStatusDto) {
    const { status } = updateUserStatusDto;

    // --- Step 1: Enforce the status in Supabase Auth ---
    // Supabase's 'ban_duration' is used to activate/deactivate.
    // 'none' = banned indefinitely. '0s' = unbanned.
    const banDuration = status === 'Inactif' ? 'none' : '0s';

    const { error: authError } = await this.supabaseAdmin.auth.admin.updateUserById(
      userId,
      { ban_duration: banDuration }
    );

    if (authError) {
      throw new BadRequestException(`Supabase Auth Error: Failed to update user status. ${authError.message}`);
    }

    // After successfully updating in Supabase, also update our local database
    // to keep it in sync.
    return this.prisma.utilisateur.update({
      where: { id: userId },
      data: { status: status },
    });
  }

  /**
   * Allows a logged-in user to change their own password.
   */
  async updateMyPassword(loggedInUser: Utilisateur, updateMyPasswordDto: ChangePasswordDto) {
    // This logic is only for a SousAdmin, so we can be sure they have an account.
    if (loggedInUser.userType !== 'SousAdmin') {
        throw new UnauthorizedException('Only administrators can perform this action.');
    }

    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    if (!supabaseAnonKey) {
        throw new Error('SUPABASE_ANON_KEY is not set in environment variables.');
    }

    // Step 1: Verify the admin's CURRENT password by trying to sign in.
    const tempSupabaseClient = createClient(process.env.SUPABASE_URL!, supabaseAnonKey);
    const { error: signInError } = await tempSupabaseClient.auth.signInWithPassword({
        email: loggedInUser.email,
        password: updateMyPasswordDto.currentPassword,
    });

    if (signInError) {
      throw new UnauthorizedException('Current password is incorrect.');
    }

    // Step 2: Update the password in Supabase Auth using the powerful admin client.
    const { error: updateError } = await this.supabaseAdmin.auth.admin.updateUserById(
      loggedInUser.id,
      { password: updateMyPasswordDto.newPassword }
    );

    if (updateError) {
      throw new BadRequestException(`Failed to update password: ${updateError.message}`);
    }

    return { message: 'Password updated successfully.' };
  }
}