import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@titans-tech/db';
import { ServiceSection } from '@titans-tech/shared/enums';
import { PrismaService } from '../shared/prisma.service';
import {
  CreateBlueprintWithThresholdsDto,
  CreateBlueprintDto,
} from '@titans-tech/shared/backend-dtos';
import { convertThresholdToDecimal } from '../alerts/threshold.utils';

@Injectable()
export class BlueprintsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createBlueprintDto: CreateBlueprintDto | CreateBlueprintWithThresholdsDto,
  ): Promise<Prisma.BlueprintGetPayload<object>> {
    const sections = this.validateSections(createBlueprintDto.sections);

    // Use transaction to create both Blueprint and Thresholds atomically
    return await this.prisma.$transaction(async (tx) => {
      // 1. Create Blueprint
      const blueprint = await tx.blueprint.create({
        data: {
          name: createBlueprintDto.name,
          fields: createBlueprintDto.fields as unknown as Prisma.InputJsonValue,
          sections: sections,
        },
      });

      // 2. Create Thresholds if provided
      const dto = createBlueprintDto as CreateBlueprintWithThresholdsDto;
      if (dto.thresholds) {
        await tx.thresholdBearingClearance.create({
          data: {
            blueprintId: blueprint.id,
            ...convertThresholdToDecimal(dto.thresholds),
          },
        });
      }

      return blueprint;
    });
  }

  private validateSections(sections: ServiceSection[]): ServiceSection[] {
    const validSections = Object.values(ServiceSection);

    return sections.map((section) => {
      const normalizedSection =
        typeof section === 'string' ? section.toUpperCase() : section;

      if (!validSections.includes(normalizedSection as ServiceSection)) {
        throw new BadRequestException(
          `Invalid inspection section: ${section}. Valid values are: ${validSections.join(', ')}`,
        );
      }

      return normalizedSection as ServiceSection;
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
