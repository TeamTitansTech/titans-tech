import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, InspectionSection } from '@titans-tech/db';
import { PrismaService } from '../prisma.service';
import { CreateBlueprintDto } from './dto/create-blueprint.dto';

@Injectable()
export class BlueprintsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createBlueprintDto: CreateBlueprintDto,
  ): Promise<Prisma.BlueprintGetPayload<object>> {
    const sections = this.validateSections(createBlueprintDto.sections);

    const blueprint = await this.prisma.blueprint.create({
      data: {
        name: createBlueprintDto.name,
        fields: createBlueprintDto.fields as unknown as Prisma.InputJsonValue,
        sections: sections,
      },
    });

    return blueprint;
  }

  private validateSections(sections: InspectionSection[]): InspectionSection[] {
    const validSections = Object.values(InspectionSection);

    return sections.map((section) => {
      const normalizedSection =
        typeof section === 'string' ? section.toUpperCase() : section;

      if (!validSections.includes(normalizedSection as InspectionSection)) {
        throw new BadRequestException(
          `Invalid inspection section: ${section}. Valid values are: ${validSections.join(', ')}`,
        );
      }

      return normalizedSection as InspectionSection;
    });
  }

  async findAll(): Promise<
    Prisma.BlueprintGetPayload<{
      include: { _count: { select: { machines: true } } };
    }>[]
  > {
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

  async findOne(id: string): Promise<
    Prisma.BlueprintGetPayload<{
      include: { machines: { include: { fields: true } } };
    }>
  > {
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

  async softDelete(id: string): Promise<Prisma.BlueprintGetPayload<object>> {
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
