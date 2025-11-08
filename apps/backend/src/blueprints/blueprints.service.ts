import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@titans-tech/db';
import { PrismaService } from '../prisma.service';
import { CreateBlueprintDto } from './dto/create-blueprint.dto';

@Injectable()
export class BlueprintsService {
  constructor(private prisma: PrismaService) {}

  async create(createBlueprintDto: CreateBlueprintDto) {
    // Convert section strings to InspectionSection enum values (uppercase)
    const sections = createBlueprintDto.sections.map((section) =>
      typeof section === 'string' ? section.toUpperCase() : section,
    ) as any[];

    const blueprint = await this.prisma.blueprint.create({
      data: {
        name: createBlueprintDto.name,
        fields: createBlueprintDto.fields as unknown as Prisma.InputJsonValue,
        sections: sections,
      },
    });

    return blueprint;
  }

  async findAll() {
    return this.prisma.blueprint.findMany({
      where: {
        deletedAt: null, // Only return non-deleted blueprints
      },
      include: {
        _count: {
          select: {
            machines: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const blueprint = await this.prisma.blueprint.findUnique({
      where: { id },
      include: {
        machines: {
          include: {
            fields: true,
          },
        },
      },
    });

    if (!blueprint || blueprint.deletedAt) {
      throw new NotFoundException(`Blueprint with ID ${id} not found`);
    }

    return blueprint;
  }

  async softDelete(id: string) {
    const blueprint = await this.prisma.blueprint.findUnique({
      where: { id },
    });

    if (!blueprint || blueprint.deletedAt) {
      throw new NotFoundException(`Blueprint with ID ${id} not found`);
    }

    return this.prisma.blueprint.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
