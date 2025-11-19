import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMissionDto } from './dto/create-mission.dto';
import { QueryMissionDto } from './dto/query-mission.dto';
import { MissionStatus, Prisma } from '@prisma/client'; 
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class MissionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  /**
   * Creates a new mission and connects it to existing entities.
   * (For Admins)
   */
  async create(createMissionDto: CreateMissionDto) {
    const {
      clientId,
      chauffeurDepartId,
      chauffeurArriveeId,
      vehiculeDepartId,
      vehiculeArriveeId,
      // Destructure all relation IDs
      ...missionData // `missionData` now only contains primitive fields
    } = createMissionDto;

    return this.prisma.mission.create({
      data: {
        // 1. Pass all the primitive fields directly
        missionCode: missionData.missionCode,
        missionType: missionData.missionType,
        chargementType: missionData.chargementType,
        status: missionData.status,
        dateDepart: missionData.dateDepart ? new Date(missionData.dateDepart) : undefined,
        heurePresenceObligatoire: missionData.heurePresenceObligatoire,
        heureDepartEstimee: missionData.heureDepartEstimee,
        dateArriveeEstimee: missionData.dateArriveeEstimee ? new Date(missionData.dateArriveeEstimee) : undefined,
        heureArriveeEstimee: missionData.heureArriveeEstimee,
        lieuDepart: missionData.lieuDepart,
        lieuArrivee: missionData.lieuArrivee,
        distanceEstimeeKm: missionData.distanceEstimeeKm,

        // 2. Use Prisma's 'connect' syntax for all relations
        client: { connect: { id: clientId } },
        chauffeurDepart: { connect: { id: chauffeurDepartId } },
        vehiculeDepart: { connect: { id: vehiculeDepartId } },

        // 3. Conditionally connect optional relations
        chauffeurArrivee: chauffeurArriveeId
          ? { connect: { id: chauffeurArriveeId } }
          : undefined,
        vehiculeArrivee: vehiculeArriveeId
          ? { connect: { id: vehiculeArriveeId } }
          : undefined,
      },
      // Include related data in the response for confirmation
      include: {
        client: true,
        chauffeurDepart: { include: { utilisateur: true } },
        vehiculeDepart: true,
      }
    });
  }

  /**
   * Finds all missions with their core related data for a list view.
   * (For Admins)
   */
 async findAll(queryDto: QueryMissionDto) {
    const {
      search,
      page,
      limit,
      status,
      clientId,
      chauffeurId,
      dateFrom,
      dateTo,
    } = queryDto;
    const skip = (page - 1) * limit;

    const where: Prisma.MissionWhereInput = {};

     if (status) {
      where.status = status;
    }
    if (clientId) {
      where.clientId = clientId;
    }
    if (chauffeurId) {
      // Allow filtering by either departure or arrival chauffeur
      where.OR = [
        { chauffeurDepartId: chauffeurId },
        { chauffeurArriveeId: chauffeurId },
      ];
    }
    if (dateFrom && dateTo) {
      where.dateDepart = {
        gte: new Date(dateFrom), // gte: greater than or equal to
        lte: new Date(dateTo),   // lte: less than or equal to
      };
    } else if (dateFrom) {
      where.dateDepart = { gte: new Date(dateFrom) };
    } else if (dateTo) {
      where.dateDepart = { lte: new Date(dateTo) };
    }

    // --- Apply GENERIC search term across multiple fields ---
    if (search) {
      // If other 'OR' conditions exist (like for chauffeurId), we add to them.
      // Otherwise, we create a new 'OR' array.
      const searchCondition = {
        OR: [
          { missionCode: { contains: search, mode: 'insensitive' } },
          { client: { companyName: { contains: search, mode: 'insensitive' } } },
          { chauffeurDepart: { utilisateur: { fullName: { contains: search, mode: 'insensitive' } } } },
          { vehiculeDepart: { immatriculation: { contains: search, mode: 'insensitive' } } },
        ],
      };
      
      // Merge search conditions with existing where clause
      where.AND = where.AND ? [...(where.AND as any[]), searchCondition] : [searchCondition];
    }

    const [missions, total] = await this.prisma.$transaction([
      this.prisma.mission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: { select: { companyName: true } },
          chauffeurDepart: { include: { utilisateur: { select: { fullName: true } } } },
          vehiculeDepart: { select: { immatriculation: true, marque: true } },
        },
      }),
      this.prisma.mission.count({ where }),
    ]);

    return {
      data: missions,
      total,
      page,
      limit,
    };
  }
  /**
   * Finds a single mission by its ID with all its details.
   * (For Admins)
   */
  async findOne(id: number) {
    const mission = await this.prisma.mission.findUnique({
      where: { id },
      include: {
        client: true,
        chauffeurDepart: { include: { utilisateur: true } },
        chauffeurArrivee: { include: { utilisateur: true } },
        vehiculeDepart: true,
        vehiculeArrivee: true,
        etapes: true, // Include all mission waypoints
        documents: true, // Include all mission documents
      },
    });

    if (!mission) {
      throw new NotFoundException(`Mission with ID ${id} not found.`);
    }
    return mission;
  }

  /**
   * Finds all active missions assigned to a specific chauffeur.
   * (For Mobile App)
   */
  async findActiveMissionsForChauffeur(chauffeurId: number) {
    return this.prisma.mission.findMany({
      where: {
        chauffeurDepartId: chauffeurId,
        // You can add more conditions, e.g., status is 'En_cours' or 'Programme'
        status: { in: ['En_cours', 'Programme'] },
      },
      include: {
        client: { select: { companyName: true, address: true } },
      },
      orderBy: { dateDepart: 'asc' },
    });
  }

  async updateStatusByChauffeur(missionId: number, chauffeurId: number, status: MissionStatus) {
    // Step 1: Find the mission and verify the chauffeur is assigned to it.
    const mission = await this.prisma.mission.findFirst({
      where: {
        id: missionId,
        // Ensure the mission belongs to the chauffeur making the request
        chauffeurDepartId: chauffeurId,
      },
      include: {
          chauffeurDepart: { include: { utilisateur: true } }
      }
    });

    if (!mission) {
      throw new NotFoundException(`Mission with ID ${missionId} not found or you are not authorized to modify it.`);
    }

    // Check if the status is actually changing to avoid sending notifications unnecessarily.
    if (mission.status === status) {
        return mission; // Return the mission without changes if status is the same.
    }

    // Step 2: Update the mission status in the database.
    const updatedMission = await this.prisma.mission.update({
      where: { id: missionId },
      data: { 
        status: status,
        // If the mission is completed, we can also record the actual arrival time.
        dateArriveeReelle: status === 'Termine' ? new Date() : null
      },
    });

    // Step 3: If the new status is 'Termine', emit the notification.
    if (updatedMission.status === 'Termine') {
      const notificationPayload = {
        missionId: updatedMission.id,
        missionCode: updatedMission.missionCode,
        chauffeurName: mission.chauffeurDepart?.utilisateur.fullName || 'N/A',
      };

      this.notificationsGateway.sendToRoom(
        'admins',
        'mission_completed',
        notificationPayload,
      );
    }

    return updatedMission;
  }

}