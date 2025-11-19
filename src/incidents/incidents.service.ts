import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { CreateIncidentDto } from './dto/create-incident.dto';

@Injectable()
export class IncidentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  /**
   * Creates a new incident reported by a chauffeur and notifies admins.
   */
  async createIncidentByChauffeur(chauffeurId: number, createIncidentDto: CreateIncidentDto) {
    const { missionId, ...incidentData } = createIncidentDto;

    const newIncident = await this.prisma.incident.create({
      data: {
        ...incidentData,
        date: new Date(incidentData.date),
        // Connect to the chauffeur who reported it
        chauffeur: { connect: { id: chauffeurId } },
        // Optionally, connect to the mission during which it occurred
        mission: missionId ? { connect: { id: missionId } } : undefined,
      },
      // Include related data needed for the notification payload
      include: {
        chauffeur: { include: { utilisateur: true } },
        mission: { select: { missionCode: true } },
      },
    });

    // --- EMIT THE NOTIFICATION ---
    const notificationPayload = {
      incidentId: newIncident.id,
      incidentType: newIncident.incidentType,
      description: newIncident.description,
      chauffeurName: newIncident.chauffeur.utilisateur.fullName,
      missionCode: newIncident.mission?.missionCode || 'N/A',
    };

    this.notificationsGateway.sendToRoom(
      'admins',
      'new_incident_reported',
      notificationPayload,
    );

    return newIncident;
  }
}