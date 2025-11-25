import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import {
  CreatePermissionTemplateDto,
  UpdatePermissionTemplateDto,
  PermissionTemplateResponseDto,
} from '@titans-tech/shared/backend-dtos';

@Injectable()
export class PermissionTemplatesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Validate that user has access to a company
   */
  private async validateUserCompanyAccess(
    userId: string,
    companyId: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        companyId: true,
        isCompanyAdmin: true,
        isCompanyManager: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.companyId !== companyId) {
      throw new ForbiddenException('You do not have access to this company');
    }

    // Only admins and managers can manage permission templates
    if (!user.isCompanyAdmin && !user.isCompanyManager) {
      throw new ForbiddenException(
        'Only company administrators and managers can manage permission templates',
      );
    }
  }

  /**
   * Create a new permission template
   */
  async create(
    userId: string,
    createDto: CreatePermissionTemplateDto,
  ): Promise<PermissionTemplateResponseDto> {
    await this.validateUserCompanyAccess(userId, createDto.companyId);

    const template = await this.prisma.permissionTemplate.create({
      data: {
        name: createDto.name,
        description: createDto.description,
        permissions: createDto.permissions as any, // Prisma Json type
        companyId: createDto.companyId,
      },
    });

    return this.mapToResponseDto(template);
  }

  /**
   * Get all templates for a company
   */
  async findAllByCompany(
    userId: string,
    companyId: string,
  ): Promise<PermissionTemplateResponseDto[]> {
    await this.validateUserCompanyAccess(userId, companyId);

    const templates = await this.prisma.permissionTemplate.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });

    return templates.map(this.mapToResponseDto);
  }

  /**
   * Get a specific template by ID
   */
  async findOne(
    userId: string,
    templateId: string,
  ): Promise<PermissionTemplateResponseDto> {
    const template = await this.prisma.permissionTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException('Permission template not found');
    }

    await this.validateUserCompanyAccess(userId, template.companyId);

    return this.mapToResponseDto(template);
  }

  /**
   * Update a permission template
   */
  async update(
    userId: string,
    templateId: string,
    updateDto: UpdatePermissionTemplateDto,
  ): Promise<PermissionTemplateResponseDto> {
    const existing = await this.prisma.permissionTemplate.findUnique({
      where: { id: templateId },
    });

    if (!existing) {
      throw new NotFoundException('Permission template not found');
    }

    await this.validateUserCompanyAccess(userId, existing.companyId);

    const updated = await this.prisma.permissionTemplate.update({
      where: { id: templateId },
      data: {
        ...(updateDto.name && { name: updateDto.name }),
        ...(updateDto.description !== undefined && {
          description: updateDto.description,
        }),
        ...(updateDto.permissions && {
          permissions: updateDto.permissions as any,
        }),
      },
    });

    return this.mapToResponseDto(updated);
  }

  /**
   * Delete a permission template
   */
  async remove(userId: string, templateId: string): Promise<void> {
    const existing = await this.prisma.permissionTemplate.findUnique({
      where: { id: templateId },
    });

    if (!existing) {
      throw new NotFoundException('Permission template not found');
    }

    await this.validateUserCompanyAccess(userId, existing.companyId);

    await this.prisma.permissionTemplate.delete({
      where: { id: templateId },
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
