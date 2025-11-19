import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { QueryDto } from '../common/dto/query.dto'; // <-- Import QueryDto
import { Prisma } from '@prisma/client';         // <-- Import Prisma type

@Injectable()
export class ClientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async create(createClientDto: CreateClientDto) {
    return this.prisma.client.create({
      data: createClientDto,
    });
  }

  async findAll(queryDto: QueryDto) {
    const { search, page, limit } = queryDto;
    const skip = (page - 1) * limit;

    const where: Prisma.ClientWhereInput = {};

    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { status: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [clients, total] = await this.prisma.$transaction([
      this.prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: { companyName: 'asc' },
      }),
      this.prisma.client.count({ where }),
    ]);

    return {
      data: clients,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: { missions: true }, // Include mission history in the detail view
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found.`);
    }
    return client;
  }

  async update(id: number, updateClientDto: UpdateClientDto) {
    await this.findOne(id); // Ensure the client exists
    return this.prisma.client.update({
      where: { id },
      data: updateClientDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Ensure the client exists
    return this.prisma.client.delete({
      where: { id },
    });
  }

  async uploadProfilePicture(clientId: number, file: Express.Multer.File) {
    // Ensure the client exists first
    await this.findOne(clientId);

    const bucket = 'profile-pictures'; // Re-use the same public bucket
    const folderPath = `client-${clientId}`;

    // 1. Upload the file and get its path
    const { path } = await this.storageService.upload(file, bucket, folderPath);

    // 2. Since the bucket is public, get the permanent public URL
    const publicUrl = this.storageService.getPublicUrl(bucket, path);

    // 3. Save the public URL to the client's record
    return this.prisma.client.update({
      where: { id: clientId },
      data: { profilePictureUrl: publicUrl },
    });
  }
}