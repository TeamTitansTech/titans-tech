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
import { JwtPayload, isSysAdmin } from '../../types/request';

@Injectable()
export class PermissionTemplatesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Validate that user has access to a company
   * SysAdmins have access to all companies
   */
  private async validateUserCompanyAccess(
    userPayload: JwtPayload,
    companyId: string,
  ): Promise<void> {
    // SysAdmins have access to all companies
    if (isSysAdmin(userPayload)) {
      return;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userPayload.id },
      select: {
        companyId: true,
        isCompanyAdmin: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.companyId !== companyId) {
      throw new ForbiddenException('You do not have access to this company');
    }

    // Only admins can manage permission templates
    if (!user.isCompanyAdmin) {
      throw new ForbiddenException(
        'Only company administrators can manage permission templates',
      );
    }
  }

  /**
   * Create a new permission template
   */
  async create(
    userPayload: JwtPayload,
    createDto: CreatePermissionTemplateDto,
  ): Promise<PermissionTemplateResponseDto> {
    await this.validateUserCompanyAccess(userPayload, createDto.companyId);

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
    userPayload: JwtPayload,
    companyId: string,
  ): Promise<PermissionTemplateResponseDto[]> {
    await this.validateUserCompanyAccess(userPayload, companyId);

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
    userPayload: JwtPayload,
    templateId: string,
  ): Promise<PermissionTemplateResponseDto> {
    const template = await this.prisma.permissionTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException('Permission template not found');
    }

    await this.validateUserCompanyAccess(userPayload, template.companyId);

    return this.mapToResponseDto(template);
  }

  /**
   * Update a permission template
   */
  async update(
    userPayload: JwtPayload,
    templateId: string,
    updateDto: UpdatePermissionTemplateDto,
  ): Promise<PermissionTemplateResponseDto> {
    const existing = await this.prisma.permissionTemplate.findUnique({
      where: { id: templateId },
    });

    if (!existing) {
      throw new NotFoundException('Permission template not found');
    }

    await this.validateUserCompanyAccess(userPayload, existing.companyId);

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
  async remove(userPayload: JwtPayload, templateId: string): Promise<void> {
    const existing = await this.prisma.permissionTemplate.findUnique({
      where: { id: templateId },
    });

    if (!existing) {
      throw new NotFoundException('Permission template not found');
    }

    await this.validateUserCompanyAccess(userPayload, existing.companyId);

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
