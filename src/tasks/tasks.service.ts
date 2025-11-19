import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  /**
   * This method will run automatically every day at a specific time.
   * CronExpression.EVERY_DAY_AT_9AM = '0 9 * * *' (At 09:00 AM)
   * We can use a simpler expression for testing.
   */
@Cron(CronExpression.EVERY_DAY_AT_9AM, { /* ... */ })
async handleDocumentExpirationCheck() {
    this.logger.log('Running daily check for expiring chauffeur documents...');

    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const potentiallyExpiringDocs = await this.prisma.documentChauffeur.findMany({
        where: {
            expirationDate: {
                gte: now,
                lte: thirtyDaysFromNow,
            },
        },
        include: {
            chauffeur: {
                include: {
                    utilisateur: {
                        select: { fullName: true },
                    },
                },
            },
        },
    });

    // --- THIS IS THE FIX ---
    // We create a new array that only includes documents where expirationDate is not null.
    // This acts as a "type guard" for TypeScript.
    const expiringDocuments = potentiallyExpiringDocs.filter(
        (doc): doc is typeof doc & { expirationDate: Date } => doc.expirationDate !== null
    );
    // -------------------------

    if (expiringDocuments.length === 0) {
        this.logger.log('No expiring documents found today.');
        return;
    }

    this.logger.log(`Found ${expiringDocuments.length} expiring document(s).`);

    for (const doc of expiringDocuments) {
        // Now, inside this loop, TypeScript knows `doc.expirationDate` cannot be null.
        const daysUntilExpiration = Math.ceil(
            (doc.expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        const notificationPayload = {
            chauffeurName: doc.chauffeur.utilisateur.fullName,
            documentType: doc.documentType,
            // This is also safe now.
            expirationDate: doc.expirationDate.toISOString().split('T')[0],
            daysRemaining: daysUntilExpiration,
        };

        this.notificationsGateway.sendToRoom(
            'admins',
            'document_expiring_soon',
            notificationPayload,
        );
    }
}
}