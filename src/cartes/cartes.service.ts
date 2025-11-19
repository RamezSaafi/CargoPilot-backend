import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCarteDto } from './dto/create-carte.dto';
import { UpdateCarteDto } from './dto/update-carte.dto';
import { QueryDto } from '../common/dto/query.dto'; // <-- Import
import { Prisma } from '@prisma/client';  

@Injectable()
export class CartesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCarteDto: CreateCarteDto) {
    const { chauffeurId, ...carteData } = createCarteDto;
    return this.prisma.carte.create({
      data: {
        ...carteData,
        expirationDate: carteData.expirationDate ? new Date(carteData.expirationDate) : undefined,
        // If a chauffeurId is provided, connect the card to that chauffeur.
        chauffeur: chauffeurId ? { connect: { id: chauffeurId } } : undefined,
      },
    });
  }

  async findAll(queryDto: QueryDto) {
    const { search, page, limit } = queryDto;
    const skip = (page - 1) * limit;

    const where: Prisma.CarteWhereInput = {};

    if (search) {
      where.OR = [
        { cardNumber: { contains: search, mode: 'insensitive' } },
        { chauffeur: { utilisateur: { fullName: { contains: search, mode: 'insensitive' } } } },
      ];
    }
    
    const [cartes, total] = await this.prisma.$transaction([
        this.prisma.carte.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                chauffeur: {
                    include: {
                        utilisateur: {
                            select: { fullName: true },
                        },
                    },
                },
            },
        }),
        this.prisma.carte.count({ where }),
    ]);

    return {
        data: cartes,
        total,
        page,
        limit,
    };
  }

  async findOne(id: number) {
    const carte = await this.prisma.carte.findUnique({
      where: { id },
      include: { chauffeur: { include: { utilisateur: true } } },
    });

    if (!carte) {
      throw new NotFoundException(`Card with ID ${id} not found.`);
    }
    return carte;
  }

  async update(id: number, updateCarteDto: UpdateCarteDto) {
    await this.findOne(id); // Ensure the card exists
    const { chauffeurId, ...carteData } = updateCarteDto;

    return this.prisma.carte.update({
      where: { id },
      data: {
        ...carteData,
        expirationDate: carteData.expirationDate ? new Date(carteData.expirationDate) : undefined,
        // Special logic to handle updating the assignment
        chauffeur: chauffeurId === null
          ? { disconnect: true } // If chauffeurId is null, unassign the card
          : chauffeurId !== undefined
            ? { connect: { id: chauffeurId } } // If a new ID is provided, connect it
            : undefined, // Otherwise, do nothing to the assignment
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Ensure the card exists
    return this.prisma.carte.delete({
      where: { id },
    });
  }
}