import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, ServiceSection } from '@titans-tech/db';
import { PrismaService } from '../prisma.service';
import { CreateBlueprintDto } from './dto/create-blueprint.dto';
import { CreateBlueprintWithThresholdsDto } from '@titans-tech/shared';
import { Decimal } from '@prisma/client/runtime/library';

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
            totalClearance_greenMin: new Decimal(
              dto.thresholds.totalClearance_greenMin,
            ),
            totalClearance_yellowMin: new Decimal(
              dto.thresholds.totalClearance_yellowMin,
            ),
            totalClearance_redMin: new Decimal(
              dto.thresholds.totalClearance_redMin,
            ),
            mainBearings_greenMin: new Decimal(
              dto.thresholds.mainBearings_greenMin,
            ),
            mainBearings_yellowMin: new Decimal(
              dto.thresholds.mainBearings_yellowMin,
            ),
            mainBearings_redMin: new Decimal(
              dto.thresholds.mainBearings_redMin,
            ),
            upperConnectionBearings_greenMin: new Decimal(
              dto.thresholds.upperConnectionBearings_greenMin,
            ),
            upperConnectionBearings_yellowMin: new Decimal(
              dto.thresholds.upperConnectionBearings_yellowMin,
            ),
            upperConnectionBearings_redMin: new Decimal(
              dto.thresholds.upperConnectionBearings_redMin,
            ),
            wristPinToMatingPart_greenMin: new Decimal(
              dto.thresholds.wristPinToMatingPart_greenMin,
            ),
            wristPinToMatingPart_yellowMin: new Decimal(
              dto.thresholds.wristPinToMatingPart_yellowMin,
            ),
            wristPinToMatingPart_redMin: new Decimal(
              dto.thresholds.wristPinToMatingPart_redMin,
            ),
            wristPinToBushing_greenMin: new Decimal(
              dto.thresholds.wristPinToBushing_greenMin,
            ),
            wristPinToBushing_yellowMin: new Decimal(
              dto.thresholds.wristPinToBushing_yellowMin,
            ),
            wristPinToBushing_redMin: new Decimal(
              dto.thresholds.wristPinToBushing_redMin,
            ),
            slideAdjNutToScrewSleeve_greenMin: new Decimal(
              dto.thresholds.slideAdjNutToScrewSleeve_greenMin,
            ),
            slideAdjNutToScrewSleeve_yellowMin: new Decimal(
              dto.thresholds.slideAdjNutToScrewSleeve_yellowMin,
            ),
            slideAdjNutToScrewSleeve_redMin: new Decimal(
              dto.thresholds.slideAdjNutToScrewSleeve_redMin,
            ),
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
