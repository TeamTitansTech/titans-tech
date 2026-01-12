import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import { UploadService } from '../upload/upload.service';
import {
  CreateSubsectionDto,
  UpdateSubsectionDto,
  UpdateSubsectionPartsDto,
  InitializePartsConfigDto,
  PartsConfigResponseDto,
  SectionPartsResponseDto,
  SubsectionResponseDto,
} from '@titans-tech/shared/backend-dtos';

// Default parts data - imported from frontend static data
// This maps section keys to their default subsections for initialization
const DEFAULT_SECTION_SUBSECTIONS: Record<
  string,
  Array<{
    id: string;
    name: string;
    figureReference?: string;
    description?: string;
    diagramImage?: string;
    parts: Array<{
      partNumber: string;
      description: string;
      quantity: string;
      unit: string;
      location?: string;
      notes?: string;
    }>;
  }>
> = {
  // These will be populated from frontend data or a shared module
  // For now, we'll just allow empty initialization and manual part creation
};

@Injectable()
export class MachinePartsService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  /**
   * Get the complete parts configuration for a machine
   */
  async getPartsConfig(machineId: string): Promise<PartsConfigResponseDto> {
    // Verify machine exists
    const machine = await this.prisma.machine.findUnique({
      where: { id: machineId },
    });

    if (!machine) {
      throw new NotFoundException(`Machine with ID ${machineId} not found`);
    }

    const config = await this.prisma.machinePartsConfig.findUnique({
      where: { machineId },
      include: {
        subsections: {
          include: { parts: { orderBy: { displayOrder: 'asc' } } },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    return {
      hasCustomConfig: !!config,
      config: config
        ? {
            id: config.id,
            machineId: config.machineId,
            createdAt: config.createdAt.toISOString(),
            updatedAt: config.updatedAt.toISOString(),
            subsections: config.subsections.map((s) => this.mapSubsection(s)),
          }
        : null,
    };
  }

  /**
   * Get parts for a specific section of a machine
   */
  async getSectionParts(
    machineId: string,
    sectionKey: string,
  ): Promise<SectionPartsResponseDto> {
    // Verify machine exists
    const machine = await this.prisma.machine.findUnique({
      where: { id: machineId },
    });

    if (!machine) {
      throw new NotFoundException(`Machine with ID ${machineId} not found`);
    }

    const config = await this.prisma.machinePartsConfig.findUnique({
      where: { machineId },
      include: {
        subsections: {
          where: { sectionKey },
          include: { parts: { orderBy: { displayOrder: 'asc' } } },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    return {
      hasCustomConfig: !!config?.subsections?.length,
      sectionKey,
      subsections: config?.subsections?.map((s) => this.mapSubsection(s)) ?? [],
    };
  }

  /**
   * Initialize parts configuration for a machine from defaults
   */
  async initializeFromDefaults(
    machineId: string,
    dto: InitializePartsConfigDto,
  ): Promise<PartsConfigResponseDto> {
    // Verify machine exists
    const machine = await this.prisma.machine.findUnique({
      where: { id: machineId },
    });

    if (!machine) {
      throw new NotFoundException(`Machine with ID ${machineId} not found`);
    }

    // Get or create the parts config
    let config = await this.prisma.machinePartsConfig.findUnique({
      where: { machineId },
    });

    if (!config) {
      config = await this.prisma.machinePartsConfig.create({
        data: { machineId },
      });
    }

    if (dto.copyFromDefaults) {
      // Get default subsections for this section
      const defaultSubsections =
        DEFAULT_SECTION_SUBSECTIONS[dto.sectionKey] || [];

      // Create subsections with parts
      for (let i = 0; i < defaultSubsections.length; i++) {
        const subsection = defaultSubsections[i];

        // Check if subsection already exists
        const existing = await this.prisma.machinePartsSubsection.findUnique({
          where: {
            configId_sectionKey_subsectionId: {
              configId: config.id,
              sectionKey: dto.sectionKey,
              subsectionId: subsection.id,
            },
          },
        });

        if (!existing) {
          await this.prisma.machinePartsSubsection.create({
            data: {
              configId: config.id,
              sectionKey: dto.sectionKey,
              subsectionId: subsection.id,
              name: subsection.name,
              figureReference: subsection.figureReference,
              description: subsection.description,
              diagramImageUrl: subsection.diagramImage,
              displayOrder: i,
              parts: {
                create: subsection.parts.map((part, index) => ({
                  partNumber: part.partNumber,
                  description: part.description,
                  quantity: part.quantity,
                  unit: part.unit,
                  location: part.location,
                  notes: part.notes,
                  displayOrder: index,
                })),
              },
            },
          });
        }
      }
    }

    return this.getPartsConfig(machineId);
  }

  /**
   * Create a new subsection for a section
   */
  async createSubsection(
    machineId: string,
    sectionKey: string,
    dto: CreateSubsectionDto,
  ): Promise<SubsectionResponseDto> {
    // Verify machine exists
    const machine = await this.prisma.machine.findUnique({
      where: { id: machineId },
    });

    if (!machine) {
      throw new NotFoundException(`Machine with ID ${machineId} not found`);
    }

    // Get or create the parts config
    let config = await this.prisma.machinePartsConfig.findUnique({
      where: { machineId },
    });

    if (!config) {
      config = await this.prisma.machinePartsConfig.create({
        data: { machineId },
      });
    }

    // Get max display order for this section
    const maxOrderSubsection =
      await this.prisma.machinePartsSubsection.findFirst({
        where: { configId: config.id, sectionKey },
        orderBy: { displayOrder: 'desc' },
      });
    const nextOrder = (maxOrderSubsection?.displayOrder ?? -1) + 1;

    // Create the subsection
    const subsection = await this.prisma.machinePartsSubsection.create({
      data: {
        configId: config.id,
        sectionKey,
        subsectionId: dto.subsectionId,
        name: dto.name,
        figureReference: dto.figureReference,
        description: dto.description,
        displayOrder: dto.displayOrder ?? nextOrder,
        parts: dto.parts
          ? {
              create: dto.parts.map((part, index) => ({
                partNumber: part.partNumber,
                description: part.description,
                quantity: part.quantity,
                unit: part.unit,
                location: part.location,
                notes: part.notes,
                displayOrder: part.displayOrder ?? index,
              })),
            }
          : undefined,
      },
      include: { parts: { orderBy: { displayOrder: 'asc' } } },
    });

    return this.mapSubsection(subsection);
  }

  /**
   * Update a subsection
   */
  async updateSubsection(
    machineId: string,
    subsectionId: string,
    dto: UpdateSubsectionDto,
  ): Promise<SubsectionResponseDto> {
    // Find the subsection and verify it belongs to this machine
    const subsection = await this.prisma.machinePartsSubsection.findUnique({
      where: { id: subsectionId },
      include: { config: true },
    });

    if (!subsection || subsection.config.machineId !== machineId) {
      throw new NotFoundException(
        `Subsection with ID ${subsectionId} not found for machine ${machineId}`,
      );
    }

    const updated = await this.prisma.machinePartsSubsection.update({
      where: { id: subsectionId },
      data: {
        name: dto.name,
        figureReference: dto.figureReference,
        description: dto.description,
        displayOrder: dto.displayOrder,
      },
      include: { parts: { orderBy: { displayOrder: 'asc' } } },
    });

    return this.mapSubsection(updated);
  }

  /**
   * Delete a subsection
   */
  async deleteSubsection(
    machineId: string,
    subsectionId: string,
  ): Promise<void> {
    // Find the subsection and verify it belongs to this machine
    const subsection = await this.prisma.machinePartsSubsection.findUnique({
      where: { id: subsectionId },
      include: { config: true },
    });

    if (!subsection || subsection.config.machineId !== machineId) {
      throw new NotFoundException(
        `Subsection with ID ${subsectionId} not found for machine ${machineId}`,
      );
    }

    await this.prisma.machinePartsSubsection.delete({
      where: { id: subsectionId },
    });
  }

  /**
   * Update all parts in a subsection (replace)
   */
  async updateSubsectionParts(
    machineId: string,
    subsectionId: string,
    dto: UpdateSubsectionPartsDto,
  ): Promise<SubsectionResponseDto> {
    // Find the subsection and verify it belongs to this machine
    const subsection = await this.prisma.machinePartsSubsection.findUnique({
      where: { id: subsectionId },
      include: { config: true },
    });

    if (!subsection || subsection.config.machineId !== machineId) {
      throw new NotFoundException(
        `Subsection with ID ${subsectionId} not found for machine ${machineId}`,
      );
    }

    // Delete existing parts and create new ones
    await this.prisma.$transaction(async (tx) => {
      await tx.machinePartItem.deleteMany({
        where: { subsectionId },
      });

      await tx.machinePartItem.createMany({
        data: dto.parts.map((part, index) => ({
          subsectionId,
          partNumber: part.partNumber,
          description: part.description,
          quantity: part.quantity,
          unit: part.unit,
          location: part.location,
          notes: part.notes,
          displayOrder: part.displayOrder ?? index,
        })),
      });
    });

    const updated = await this.prisma.machinePartsSubsection.findUnique({
      where: { id: subsectionId },
      include: { parts: { orderBy: { displayOrder: 'asc' } } },
    });

    return this.mapSubsection(updated!);
  }

  /**
   * Upload a diagram image for a subsection
   */
  async uploadDiagram(
    machineId: string,
    subsectionId: string,
    file: Express.Multer.File,
  ): Promise<SubsectionResponseDto> {
    // Find the subsection and verify it belongs to this machine
    const subsection = await this.prisma.machinePartsSubsection.findUnique({
      where: { id: subsectionId },
      include: { config: true },
    });

    if (!subsection || subsection.config.machineId !== machineId) {
      throw new NotFoundException(
        `Subsection with ID ${subsectionId} not found for machine ${machineId}`,
      );
    }

    // Upload to S3
    const diagramUrl = await this.uploadService.uploadImage(
      file,
      `parts-diagrams/${machineId}`,
    );

    // Update the subsection and return full data
    const updated = await this.prisma.machinePartsSubsection.update({
      where: { id: subsectionId },
      data: { diagramImageUrl: diagramUrl },
      include: { parts: { orderBy: { displayOrder: 'asc' } } },
    });

    return this.mapSubsection(updated);
  }

  /**
   * Reset a section to defaults (delete all custom subsections for this section)
   */
  async resetSectionToDefaults(
    machineId: string,
    sectionKey: string,
  ): Promise<SectionPartsResponseDto> {
    // Verify machine exists
    const machine = await this.prisma.machine.findUnique({
      where: { id: machineId },
    });

    if (!machine) {
      throw new NotFoundException(`Machine with ID ${machineId} not found`);
    }

    const config = await this.prisma.machinePartsConfig.findUnique({
      where: { machineId },
    });

    if (config) {
      // Delete all subsections for this section
      await this.prisma.machinePartsSubsection.deleteMany({
        where: {
          configId: config.id,
          sectionKey,
        },
      });
    }

    return {
      hasCustomConfig: false,
      sectionKey,
      subsections: [],
    };
  }

  /**
   * Helper to map Prisma subsection to DTO
   */
  private mapSubsection(subsection: {
    id: string;
    configId: string;
    sectionKey: string;
    subsectionId: string;
    name: string;
    figureReference: string | null;
    description: string | null;
    diagramImageUrl: string | null;
    displayOrder: number;
    createdAt: Date;
    updatedAt: Date;
    parts: Array<{
      id: string;
      subsectionId: string;
      partNumber: string;
      description: string;
      quantity: string;
      unit: string;
      location: string | null;
      notes: string | null;
      displayOrder: number;
      createdAt: Date;
      updatedAt: Date;
    }>;
  }): SubsectionResponseDto {
    return {
      id: subsection.id,
      configId: subsection.configId,
      sectionKey: subsection.sectionKey,
      subsectionId: subsection.subsectionId,
      name: subsection.name,
      figureReference: subsection.figureReference,
      description: subsection.description,
      diagramImageUrl: subsection.diagramImageUrl,
      displayOrder: subsection.displayOrder,
      createdAt: subsection.createdAt.toISOString(),
      updatedAt: subsection.updatedAt.toISOString(),
      parts: subsection.parts.map((p) => ({
        id: p.id,
        subsectionId: p.subsectionId,
        partNumber: p.partNumber,
        description: p.description,
        quantity: p.quantity,
        unit: p.unit,
        location: p.location,
        notes: p.notes,
        displayOrder: p.displayOrder,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
    };
  }
}
