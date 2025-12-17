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
import { UpdateBlueprintDto } from '../../blueprints/dto/update-blueprint.dto';
import {
  convertThresholdToDecimal,
  convertClutchThresholdToDecimal,
  convertSlideThresholdToDecimal,
  convertGibsThresholdToDecimal,
  convertPistonsThresholdToDecimal,
  convertTrammingThresholdToDecimal,
} from '../alerts/threshold.utils';

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
          imageUrl: createBlueprintDto.imageUrl,
          fields: createBlueprintDto.fields as unknown as Prisma.InputJsonValue,
          sections: sections,
        },
      });

      // 2. Create Bearing Clearance Thresholds if provided
      const dto = createBlueprintDto as CreateBlueprintWithThresholdsDto;
      if (dto.thresholds) {
        await tx.thresholdBearingClearance.create({
          data: {
            blueprintId: blueprint.id,
            ...convertThresholdToDecimal(dto.thresholds),
          },
        });
      }

      // 2b. Create Bearing Clearance Single Hammer Thresholds if provided
      if (dto.bearingClearanceSingleHammerThresholds) {
        await tx.thresholdBearingClearanceSingleHammer.create({
          data: {
            blueprintId: blueprint.id,
            ...convertThresholdToDecimal(
              dto.bearingClearanceSingleHammerThresholds,
            ),
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

      // 4. Create Slide Single Hammer Thresholds if provided
      if (dto.slideSingleHammerThresholds) {
        await tx.thresholdSlideSingleHammer.create({
          data: {
            blueprintId: blueprint.id,
            ...convertSlideThresholdToDecimal(dto.slideSingleHammerThresholds),
          },
        });
      }

      // 4b. Create Slide Double Hammer Thresholds if provided
      if (dto.slideDoubleHammerThresholds) {
        await tx.thresholdSlideDoubleHammer.create({
          data: {
            blueprintId: blueprint.id,
            ...convertSlideThresholdToDecimal(dto.slideDoubleHammerThresholds),
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

      // 6. Create Pistons Thresholds if provided
      if (dto.pistonsThresholds) {
        await tx.thresholdPistons.create({
          data: {
            blueprintId: blueprint.id,
            ...convertPistonsThresholdToDecimal(dto.pistonsThresholds),
          },
        });
      }

      // 7. Create Tramming Thresholds if provided
      if (dto.trammingThresholds) {
        await tx.thresholdTramming.create({
          data: {
            blueprintId: blueprint.id,
            ...convertTrammingThresholdToDecimal(dto.trammingThresholds),
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
            machines: { where: { deletedAt: null } },
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
          where: { deletedAt: null },
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

  async update(
    id: string,
    updateBlueprintDto: UpdateBlueprintDto,
  ): Promise<Prisma.BlueprintGetPayload<object>> {
    const blueprint = await this.prisma.blueprint.findUnique({
      where: { id },
    });

    if (!blueprint || blueprint.deletedAt) {
      throw new NotFoundException(`Blueprint with ID ${id} not found`);
    }

    const updateData: Prisma.BlueprintUpdateInput = {};

    if (updateBlueprintDto.name) {
      updateData.name = updateBlueprintDto.name;
    }

    if (updateBlueprintDto.imageUrl !== undefined) {
      updateData.imageUrl = updateBlueprintDto.imageUrl;
    }

    if (updateBlueprintDto.fields) {
      updateData.fields =
        updateBlueprintDto.fields as unknown as Prisma.InputJsonValue;
    }

    if (updateBlueprintDto.sections) {
      const sections = this.validateSections(updateBlueprintDto.sections);
      updateData.sections = sections;
    }

    return this.prisma.blueprint.update({
      where: { id },
      data: updateData,
    });
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
