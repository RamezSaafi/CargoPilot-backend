import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateVehiculeDto } from './dto/create-vehicule.dto';
import { UpdateVehiculeDto } from './dto/update-vehicule.dto';
import { CreateEntretienDto } from './dto/create-entretien.dto';
import { UpdateEntretienDto } from './dto/update-entretien.dto';
import { QueryDto } from '../common/dto/query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class VehiculesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  // =================================================================
  // VEHICULE CRUD
  // =================================================================

  async create(createVehiculeDto: CreateVehiculeDto) {
    const { chauffeurActuelId, ...vehiculeData } = createVehiculeDto;

    // We must convert DTO string dates to JavaScript Date objects for Prisma
    return this.prisma.vehicule.create({
      data: {
        ...vehiculeData,
        dateMiseCirculation: vehiculeData.dateMiseCirculation
          ? new Date(vehiculeData.dateMiseCirculation)
          : undefined,
        dateAffectationActuelle: vehiculeData.dateAffectationActuelle
          ? new Date(vehiculeData.dateAffectationActuelle)
          : undefined,
        // Handle relation: Connect chauffeur if ID is provided
        chauffeurActuel: chauffeurActuelId
          ? { connect: { id: chauffeurActuelId } }
          : undefined,
      },
      include: {
        chauffeurActuel: {
          include: { utilisateur: true },
        },
      },
    });
  }

  async findAll(queryDto: QueryDto) {
    const { search, page, limit } = queryDto;
    const skip = (page - 1) * limit;

    const where: Prisma.VehiculeWhereInput = {};

    if (search) {
      where.OR = [
        { immatriculation: { contains: search, mode: 'insensitive' } },
        { marque: { contains: search, mode: 'insensitive' } },
        { typeVehicule: { contains: search, mode: 'insensitive' } },
        // Search by driver name
        {
          chauffeurActuel: {
            utilisateur: { fullName: { contains: search, mode: 'insensitive' } },
          },
        },
      ];
    }

    const [vehicules, total] = await this.prisma.$transaction([
      this.prisma.vehicule.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        // Select only fields needed for 'VehiculeListItem'
        select: {
          id: true,
          immatriculation: true,
          marque: true,
          typeVehicule: true,
          chauffeurActuel: {
            select: {
              utilisateur: {
                select: { fullName: true },
              },
            },
          },
        },
      }),
      this.prisma.vehicule.count({ where }),
    ]);

    return {
      data: vehicules,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number) {
    const vehicule = await this.prisma.vehicule.findUnique({
      where: { id },
      // Include all relations needed for 'VehiculeDetail'
      include: {
        chauffeurActuel: {
          include: {
            utilisateur: { select: { fullName: true } },
          },
        },
        affectations: {
          orderBy: { dateDebutAffectation: 'desc' },
          include: {
            chauffeur: {
              include: {
                utilisateur: { select: { fullName: true } },
              },
            },
          },
        },
        entretiens: {
          orderBy: { dateEntretien: 'desc' },
        },
        documents: true,
      },
    });

    if (!vehicule) {
      throw new NotFoundException(`Vehicule with ID ${id} not found.`);
    }

    return vehicule;
  }

  async update(id: number, updateVehiculeDto: UpdateVehiculeDto) {
    await this.findOne(id); // Ensure existence

    const { chauffeurActuelId, ...vehiculeData } = updateVehiculeDto;

    // Logic to handle "chauffeurActuelId":
    // 1. If it is specifically null, we disconnect.
    // 2. If it is a number, we connect.
    // 3. If it is undefined (not sent), we do nothing.
    const chauffeurRelation =
      chauffeurActuelId === null
        ? { disconnect: true }
        : chauffeurActuelId
          ? { connect: { id: chauffeurActuelId } }
          : undefined;

    // Logic to Create a History Record (HistoriqueAffectation)
    // If we are assigning a new driver, we should log it.
        let createHistoryRelation: Prisma.HistoriqueAffectationUpdateManyWithoutVehiculeNestedInput | undefined;    if (chauffeurActuelId) {
        createHistoryRelation = {
            create: {
                chauffeurId: chauffeurActuelId,
                dateDebutAffectation: new Date(),
            }
        }
    }

    return this.prisma.vehicule.update({
      where: { id },
      data: {
        ...vehiculeData,
        dateMiseCirculation: vehiculeData.dateMiseCirculation
          ? new Date(vehiculeData.dateMiseCirculation)
          : undefined,
        dateAffectationActuelle: vehiculeData.dateAffectationActuelle
          ? new Date(vehiculeData.dateAffectationActuelle)
          : undefined,
        chauffeurActuel: chauffeurRelation,
        // Optional: Auto-create history log when driver changes
        affectations: createHistoryRelation
      },
    });
  }

  async uploadPhoto(id: number, file: Express.Multer.File) {
    await this.findOne(id); // Ensure existence

    const bucket = 'public-assets'; // Assuming a public bucket for vehicle photos
    const folderPath = `vehicule-${id}`;

    // Upload via StorageService
    const { path } = await this.storageService.upload(file, bucket, folderPath);
    const publicUrl = this.storageService.getPublicUrl(bucket, path);

    // Update DB
    return this.prisma.vehicule.update({
      where: { id },
      data: { photoUrl: publicUrl },
    });
  }

  // =================================================================
  // ENTRETIEN CRUD (Sub-resource)
  // =================================================================

  async addEntretien(vehiculeId: number, createEntretienDto: CreateEntretienDto) {
    await this.findOne(vehiculeId); // Ensure vehicle exists

    return this.prisma.entretien.create({
      data: {
        ...createEntretienDto,
        dateEntretien: new Date(createEntretienDto.dateEntretien),
        dateProchainEntretien: createEntretienDto.dateProchainEntretien
          ? new Date(createEntretienDto.dateProchainEntretien)
          : undefined,
        vehicule: { connect: { id: vehiculeId } },
      },
    });
  }

  async updateEntretien(entretienId: number, updateEntretienDto: UpdateEntretienDto) {
    // Verify existence
    const existing = await this.prisma.entretien.findUnique({ where: { id: entretienId } });
    if (!existing) throw new NotFoundException(`Entretien with ID ${entretienId} not found.`);

    return this.prisma.entretien.update({
      where: { id: entretienId },
      data: {
        ...updateEntretienDto,
        dateEntretien: updateEntretienDto.dateEntretien
          ? new Date(updateEntretienDto.dateEntretien)
          : undefined,
        dateProchainEntretien: updateEntretienDto.dateProchainEntretien
          ? new Date(updateEntretienDto.dateProchainEntretien)
          : undefined,
      },
    });
  }

  async removeEntretien(entretienId: number) {
    const existing = await this.prisma.entretien.findUnique({ where: { id: entretienId } });
    if (!existing) throw new NotFoundException(`Entretien with ID ${entretienId} not found.`);

    return this.prisma.entretien.delete({
      where: { id: entretienId },
    });
  }
}