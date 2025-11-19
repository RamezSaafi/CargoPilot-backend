import { Inject, Injectable, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateChauffeurDto } from './dto/create-chauffeur.dto';
import { SUPABASE_ADMIN_CLIENT } from '../supabase/supabase-admin.provider';
import { EmailService } from '../email/email.service';
import { StorageService } from '../storage/storage.service';
import { QueryDto } from '../common/dto/query.dto';
import { Prisma } from '@prisma/client';
import { CreateFormationDto } from './dto/create-formation.dto';
import { CreateIncidentDto } from '../incidents/dto/create-incident.dto';

@Injectable()
export class ChauffeursService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(SUPABASE_ADMIN_CLIENT) private readonly supabaseAdmin: SupabaseClient,
    private readonly emailService: EmailService,
    private readonly storageService: StorageService,
  ) {}

  // =================================================================
  // WRITE METHODS (Create, Update, Delete)
  // =================================================================

  async create(createChauffeurDto: CreateChauffeurDto) {
    const { email, password, fullName, activerAccesMobile, ...chauffeurProfileData } = createChauffeurDto;
    
    // `chauffeurProfileData` now safely contains ONLY fields for the Chauffeur model,
    // like `chauffeurCode`, `birthDate`, `licenseNumber`, etc.

    const { data: authData, error: authError } = await this.supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (authError) {
      if (authError.message.includes('unique constraint')) {
        throw new ConflictException('A user with this email already exists.');
      }
      throw new InternalServerErrorException(`Supabase Auth Error: ${authError.message}`);
    }

    const newAuthUser = authData.user;
    const userStatus = activerAccesMobile ? 'Actif' : 'Inactif';

    try {
      const newChauffeur = await this.prisma.chauffeur.create({
        data: {
          // 1. Spread ONLY the chauffeur-specific data
          ...chauffeurProfileData,
          // Convert date string if it exists
          birthDate: chauffeurProfileData.birthDate ? new Date(chauffeurProfileData.birthDate) : null,
          
          // 2. Create the related Utilisateur record explicitly
          utilisateur: {
            create: {
              id: newAuthUser.id,
              email: email,
              fullName: fullName,
              userType: 'Chauffeur',
              status: userStatus,
            },
          },
        },
        include: { utilisateur: true },
      });

      await this.supabaseAdmin.auth.admin.updateUserById(newAuthUser.id, {
        ban_duration: userStatus === 'Inactif' ? 'none' : '0s',
      });
      
      const subject = 'Your CargoPilot Account Credentials';
      const htmlBody = `<h1>Welcome to CargoPilot, ${fullName}!</h1><p>Email: ${email}</p><p>Password: ${password}</p>...`;
      await this.emailService.sendEmail(email, subject, htmlBody);

      return newChauffeur;
    } catch (dbError) {
      await this.supabaseAdmin.auth.admin.deleteUser(newAuthUser.id);
      throw new InternalServerErrorException(`Database Error: Could not create chauffeur profile. ${dbError.message}`);
    }
  }

  // =================================================================
  // READ METHODS (FindAll, FindOne)
  // =================================================================

  async findAll(queryDto: QueryDto) {
    const { search, page, limit } = queryDto;
    const skip = (page - 1) * limit;
    const where: Prisma.ChauffeurWhereInput = {};

    if (search) {
      where.OR = [
        { chauffeurCode: { contains: search, mode: 'insensitive' } },
        { utilisateur: { fullName: { contains: search, mode: 'insensitive' } } },
        { utilisateur: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [chauffeurs, total] = await this.prisma.$transaction([
      this.prisma.chauffeur.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          utilisateur: { select: { fullName: true, email: true, status: true } },
        },
      }),
      this.prisma.chauffeur.count({ where }),
    ]);
    
    return { data: chauffeurs, total, page, limit };
  }

  async findOne(chauffeurId: number) {
    const chauffeur = await this.prisma.chauffeur.findUnique({
      where: { id: chauffeurId },
      include: {
        utilisateur: true,
        documents: { orderBy: { createdAt: 'desc' } },
        formations: { orderBy: { dateCompleted: 'desc' } },
        incidents: { orderBy: { date: 'desc' } },
        missionsAsChauffeurDepart: {
          take: 10,
          orderBy: { dateDepart: 'desc' },
        },
      },
    });

    if (!chauffeur) {
      throw new NotFoundException(`Chauffeur with ID ${chauffeurId} not found.`);
    }

    const currentVehicle = await this.prisma.vehicule.findFirst({
      where: { chauffeurActuelId: chauffeurId },
    });
    
    return { ...chauffeur, currentVehicle };
  }

  async findChauffeurByUserId(userId: string) {
    return this.prisma.chauffeur.findUnique({
      where: { utilisateurId: userId },
      include: { utilisateur: true },
    });
  }

  // =================================================================
  // FILE MANAGEMENT METHODS
  // =================================================================

  async uploadProfilePicture(chauffeurId: number, file: Express.Multer.File) {
    const chauffeur = await this.findOne(chauffeurId);
    const bucket = 'profile-pictures';
    const folderPath = `chauffeur-${chauffeur.id}`;
    const { path } = await this.storageService.upload(file, bucket, folderPath);
    const publicUrl = this.storageService.getPublicUrl(bucket, path);
    return this.prisma.chauffeur.update({
      where: { id: chauffeurId },
      data: { profilePictureUrl: publicUrl },
    });
  }

  async uploadDocument(chauffeurId: number, file: Express.Multer.File, documentType: string, expirationDate?: string) {
    await this.findOne(chauffeurId);
    const bucket = 'documents-chauffeurs';
    const folderPath = `chauffeur-${chauffeurId}`;
    const { path } = await this.storageService.upload(file, bucket, folderPath);

    return this.prisma.documentChauffeur.create({
      data: {
        chauffeurId: chauffeurId,
        documentType: documentType,
        fileUrl: path, // We store the path
        // ** THIS IS THE FIX **
        // Use the expirationDate parameter, converting it to a Date object if it exists.
        expirationDate: expirationDate ? new Date(expirationDate) : null,
      },
    });
  }

  async getDocumentUrl(documentId: number) {
    const document = await this.prisma.documentChauffeur.findUnique({
      where: { id: documentId },
    });
    if (!document) { throw new NotFoundException('Document not found.'); }

    const bucket = 'documents-chauffeurs';
    const path = document.fileUrl;
    const signedUrl = await this.storageService.createSignedUrl(bucket, path);
    return { url: signedUrl };
  }

  // =================================================================
  // RELATED DATA MANAGEMENT METHODS (Formations, Incidents)
  // =================================================================

  async addFormation(chauffeurId: number, createFormationDto: CreateFormationDto) {
    await this.findOne(chauffeurId);
    return this.prisma.formation.create({
      data: {
        ...createFormationDto,
        dateCompleted: createFormationDto.dateCompleted ? new Date(createFormationDto.dateCompleted) : undefined,
        chauffeur: { connect: { id: chauffeurId } },
      },
    });
  }

  async addIncident(chauffeurId: number, createIncidentDto: CreateIncidentDto) {
    await this.findOne(chauffeurId);
    const { missionId, ...incidentData } = createIncidentDto;
    return this.prisma.incident.create({
      data: {
        ...incidentData,
        date: new Date(incidentData.date),
        chauffeur: { connect: { id: chauffeurId } },
        mission: missionId ? { connect: { id: missionId } } : undefined,
      },
    });
  }
}