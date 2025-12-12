import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import {
  CreatePermissionTemplateBodyDto,
  UpdatePermissionTemplateDto,
  PermissionTemplateResponseDto,
} from '@titans-tech/shared/backend-dtos';
import {
  Permissions,
  BranchPermissionType,
  enableWithPrerequisites,
} from '@titans-tech/shared/types/permissions';
import { softDeleteData } from '../shared/soft-delete.utils';

@Injectable()
export class PermissionTemplatesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Normalize permissions by auto-enabling all prerequisites
   * This ensures templates always have valid permission dependencies
   */
  private normalizePermissions(permissions: Permissions): Permissions {
    let normalized = { ...permissions };

    // For each enabled permission, ensure all prerequisites are also enabled
    for (const [perm, enabled] of Object.entries(permissions)) {
      if (enabled) {
        normalized = enableWithPrerequisites(
          normalized,
          perm as BranchPermissionType,
        );
      }
    }

    return normalized;
  }

  /**
   * Create a new permission template
   * Authorization handled by @CompanyAdmin decorator in controller
   */
  async create(
    companyId: string,
    createDto: CreatePermissionTemplateBodyDto,
  ): Promise<PermissionTemplateResponseDto> {
    const normalizedPermissions = this.normalizePermissions(
      createDto.permissions as Permissions,
    );

    const template = await this.prisma.permissionTemplate.create({
      data: {
        name: createDto.name,
        description: createDto.description,
        permissions: normalizedPermissions as any, // Prisma Json type
        companyId,
      },
    });

    return this.mapToResponseDto(template);
  }

  /**
   * Get all templates for a company
   */
  async findAllByCompany(
    companyId: string,
  ): Promise<PermissionTemplateResponseDto[]> {
    const templates = await this.prisma.permissionTemplate.findMany({
      where: {
        companyId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    return templates.map(this.mapToResponseDto);
  }

  /**
   * Get a specific template by ID
   */
  async findOne(
    companyId: string,
    templateId: string,
  ): Promise<PermissionTemplateResponseDto> {
    const template = await this.prisma.permissionTemplate.findFirst({
      where: {
        id: templateId,
        companyId,
        deletedAt: null,
      },
    });

    if (!template) {
      throw new NotFoundException('Permission template not found');
    }

    return this.mapToResponseDto(template);
  }

  /**
   * Update a permission template
   */
  async update(
    companyId: string,
    templateId: string,
    updateDto: UpdatePermissionTemplateDto,
  ): Promise<PermissionTemplateResponseDto> {
    const existing = await this.prisma.permissionTemplate.findFirst({
      where: {
        id: templateId,
        companyId,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new NotFoundException('Permission template not found');
    }

    // Auto-correct permissions if provided
    const normalizedPermissions = updateDto.permissions
      ? this.normalizePermissions(updateDto.permissions as Permissions)
      : undefined;

    const updated = await this.prisma.permissionTemplate.update({
      where: { id: templateId },
      data: {
        ...(updateDto.name && { name: updateDto.name }),
        ...(updateDto.description !== undefined && {
          description: updateDto.description,
        }),
        ...(normalizedPermissions && {
          permissions: normalizedPermissions as any,
        }),
      },
    });

    return this.mapToResponseDto(updated);
  }

  /**
   * Delete a permission template
   */
  async remove(companyId: string, templateId: string): Promise<void> {
    const existing = await this.prisma.permissionTemplate.findFirst({
      where: {
        id: templateId,
        companyId,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new NotFoundException('Permission template not found');
    }

    await this.prisma.permissionTemplate.update({
      where: { id: templateId },
      data: softDeleteData(),
    });
  }

  /**
   * Map Prisma model to response DTO
   */
  private mapToResponseDto(template: any): PermissionTemplateResponseDto {
    return {
      id: template.id,
      name: template.name,
      description: template.description,
      permissions: template.permissions as any,
      companyId: template.companyId,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }
}
