import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ChauffeursModule } from './chauffeurs/chauffeurs.module';
import { VehiculesModule } from './vehicules/vehicules.module';
import { MissionsModule } from './missions/missions.module';
import { ClientsModule } from './clients/clients.module';
import { CartesModule } from './cartes/cartes.module';
import { EmailModule } from './email/email.module';
import { StorageModule } from './storage/storage.module';
import { UsersModule } from './users/users.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ContactModule } from './contact/contact.module';
import { NotificationsModule } from './notifications/notifications.module';
import { IncidentsModule } from './incidents/incidents.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './tasks/tasks.module';



@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule,PrismaModule, ChauffeursModule, VehiculesModule, MissionsModule, ClientsModule, CartesModule, EmailModule, StorageModule, UsersModule, DashboardModule, ContactModule, NotificationsModule, IncidentsModule,ScheduleModule.forRoot(), TasksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
