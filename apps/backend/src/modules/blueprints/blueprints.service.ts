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
  UpdateBlueprintDto,
} from '@titans-tech/shared/backend-dtos';
import { UpdateBlueprintDto } from '../../blueprints/dto/update-blueprint.dto';
import {
  convertThresholdToDecimal,
  convertClutchThresholdToDecimal,
  convertSlideThresholdToDecimal,
  convertGibsThresholdToDecimal,
} from '../alerts/threshold.utils';
import { AlertsService } from '../alerts/alerts.service';

@Injectable()
export class BlueprintsService {
  constructor(
    private prisma: PrismaService,
    private alertsService: AlertsService,
  ) {}

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
          imageUrl: createBlueprintDto.imageUrl,
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

      // 3. Create Clutch Thresholds if provided
      if (dto.clutchThresholds) {
        await tx.thresholdClutch.create({
          data: {
            blueprintId: blueprint.id,
            ...convertClutchThresholdToDecimal(dto.clutchThresholds),
          },
        });
      }

      // 4. Create Slide Thresholds if provided
      if (dto.slideThresholds) {
        await tx.thresholdSlide.create({
          data: {
            blueprintId: blueprint.id,
            ...convertSlideThresholdToDecimal(dto.slideThresholds),
          },
        });
      }

      // 5. Create GIBS Thresholds if provided
      if (dto.gibsThresholds) {
        await tx.thresholdGibs.create({
          data: {
            blueprintId: blueprint.id,
            ...convertGibsThresholdToDecimal(dto.gibsThresholds),
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
        deletedAt: null,
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
      include: {
        machines: { include: { fields: true } };
        _count: { select: { machines: true } };
      };
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
        _count: {
          select: {
            machines: true,
          },
        },
      },
    });

    if (!blueprint || blueprint.deletedAt) {
      throw new NotFoundException(`Blueprint with ID ${id} not found`);
    }

    return blueprint;
  }

  async update(
    id: string,
    updateBlueprintDto: UpdateBlueprintDto,
  ): Promise<
    Prisma.BlueprintGetPayload<{
      include: { _count: { select: { machines: true } } };
    }>
  > {
    // 1. Check if blueprint exists
    const existingBlueprint = await this.prisma.blueprint.findUnique({
      where: { id },
      include: {
        _count: {
          select: { machines: true },
        },
      },
    });

    if (!existingBlueprint || existingBlueprint.deletedAt) {
      throw new NotFoundException(`Blueprint with ID ${id} not found`);
    }

    const hasMachines = existingBlueprint._count.machines > 0;

    // 2. If blueprint has machines, only allow name, imageUrl and threshold updates
    if (hasMachines) {
      if (updateBlueprintDto.fields || updateBlueprintDto.sections) {
        throw new BadRequestException(
          'Cannot update fields or sections for blueprints with associated machines. Only name, imageUrl and thresholds can be updated.',
        );
      }
    }

    // 3. Validate sections if provided
    const sections = updateBlueprintDto.sections
      ? this.validateSections(updateBlueprintDto.sections)
      : undefined;

    // 4. Use transaction to update Blueprint and Thresholds
    const blueprint = await this.prisma.$transaction(async (tx) => {
      // Update Blueprint base fields
      const updateData: Prisma.BlueprintUpdateInput = {};

      if (updateBlueprintDto.name !== undefined) {
        updateData.name = updateBlueprintDto.name;
      }
      if (updateBlueprintDto.imageUrl !== undefined) {
        updateData.imageUrl = updateBlueprintDto.imageUrl;
      }
      if (updateBlueprintDto.fields !== undefined) {
        updateData.fields =
          updateBlueprintDto.fields as unknown as Prisma.InputJsonValue;
      }
      if (sections !== undefined) {
        updateData.sections = sections;
      }

      const blueprint = await tx.blueprint.update({
        where: { id },
        data: updateData,
        include: {
          _count: {
            select: { machines: true },
          },
        },
      });

      // Update Thresholds (upsert: create if not exists, update if exists)
      if (updateBlueprintDto.thresholds) {
        await tx.thresholdBearingClearance.upsert({
          where: { blueprintId: id },
          create: {
            blueprintId: id,
            ...convertThresholdToDecimal(updateBlueprintDto.thresholds),
          },
          update: convertThresholdToDecimal(updateBlueprintDto.thresholds),
        });
      }

      if (updateBlueprintDto.clutchThresholds) {
        await tx.thresholdClutch.upsert({
          where: { blueprintId: id },
          create: {
            blueprintId: id,
            ...convertClutchThresholdToDecimal(
              updateBlueprintDto.clutchThresholds,
            ),
          },
          update: convertClutchThresholdToDecimal(
            updateBlueprintDto.clutchThresholds,
          ),
        });
      }

      if (updateBlueprintDto.slideThresholds) {
        await tx.thresholdSlide.upsert({
          where: { blueprintId: id },
          create: {
            blueprintId: id,
            ...convertSlideThresholdToDecimal(
              updateBlueprintDto.slideThresholds,
            ),
          },
          update: convertSlideThresholdToDecimal(
            updateBlueprintDto.slideThresholds,
          ),
        });
      }

      if (updateBlueprintDto.gibsThresholds) {
        await tx.thresholdGibs.upsert({
          where: { blueprintId: id },
          create: {
            blueprintId: id,
            ...convertGibsThresholdToDecimal(updateBlueprintDto.gibsThresholds),
          },
          update: convertGibsThresholdToDecimal(
            updateBlueprintDto.gibsThresholds,
          ),
        });
      }

      return blueprint;
    });

    // 5. Regenerate alerts only for sections with updated thresholds
    const updatedSections: string[] = [];

    if (updateBlueprintDto.thresholds) {
      updatedSections.push('BEARING_CLEARANCE');
    }
    if (updateBlueprintDto.clutchThresholds) {
      updatedSections.push('CLUTCH');
    }
    if (updateBlueprintDto.slideThresholds) {
      updatedSections.push('SLIDE');
    }
    if (updateBlueprintDto.gibsThresholds) {
      updatedSections.push('GIBS');
    }

    if (updatedSections.length > 0) {
      // Run alert regeneration asynchronously (don't block the response)
      // Only regenerate alerts for the specific sections that were updated
      this.alertsService
        .regenerateAlertsForBlueprint(id, updatedSections)
        .catch((error) => {
          // Log error but don't fail the request
          console.error(
            `Failed to regenerate alerts for blueprint ${id}:`,
            error,
          );
        });
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
