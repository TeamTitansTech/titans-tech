import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import { CompanyBranchesService } from '../company-branches/company-branches.service';
import {
  CreateCompanyDto,
  UpdateCompanyDto,
  AdminManagerUserResponseDto,
} from '@titans-tech/shared/backend-dtos';
import { Prisma } from '@titans-tech/db';
import { FieldsErr } from '../../errors/err';

/**
 * Converts a string to a URL-safe slug for subdomains
 * - Converts to lowercase
 * - Removes accents/diacritics
 * - Replaces spaces and special characters with hyphens
 * - Removes consecutive hyphens
 * - Removes leading/trailing hyphens
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

@Injectable()
export class CompaniesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly companyBranchesService: CompanyBranchesService,
  ) {}

  async findAll() {
    return this.prisma.company.findMany({
      include: {
        _count: {
          select: {
            branches: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            branches: true,
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async getCompanyPublicInfo(companySlug: string) {
    const company = await this.prisma.company.findUnique({
      where: { slug: companySlug },
      select: {
        id: true,
        slug: true,
        name: true,
        logo: true,
        loginLogo: true,
        brandColor: true,
        accentColor: true,
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async create(createCompanyDto: CreateCompanyDto) {
    // Always slugify the provided slug to ensure it's valid for subdomains
    const slug = slugify(createCompanyDto.slug);

    if (!slug) {
      throw FieldsErr({
        slug: 'Invalid slug - must contain alphanumeric characters',
      });
    }

    await this.validateSlugUniqueness(slug);

    return this.prisma.$transaction(async (tx) => {
      // Create the company with the normalized slug
      const company = await tx.company.create({
        data: {
          ...createCompanyDto,
          slug,
        },
      });

      // Create a main branch based on the company name
      await tx.companyBranch.create({
        data: {
          name: createCompanyDto.name,
          isMainBranch: true,
          companyId: company.id,
        },
      });

      return company;
    });
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Slugify the slug if provided
    let normalizedSlug: string | undefined;
    if (updateCompanyDto.slug) {
      normalizedSlug = slugify(updateCompanyDto.slug);
      if (!normalizedSlug) {
        throw FieldsErr({
          slug: 'Invalid slug - must contain alphanumeric characters',
        });
      }
      await this.validateSlugUniqueness(normalizedSlug, id);
    }

    return this.prisma.company.update({
      where: { id },
      data: {
        ...updateCompanyDto,
        ...(normalizedSlug && { slug: normalizedSlug }),
      },
    });
  }

  /**
   * Soft delete cascade for company and all related entities
   * Handles: CompanyBranches → Users → PermissionTemplates → Company
   */
  private async softDeleteCompanyCascade(
    tx: Prisma.TransactionClient,
    companyId: string,
  ): Promise<void> {
    // 1. Get all branches
    const branches = await tx.companyBranch.findMany({
      where: { companyId },
      select: { id: true },
    });

    // 2. Soft delete all branches (reuses CompanyBranchesService cascade)
    for (const branch of branches) {
      await this.companyBranchesService.softDeleteCompanyBranchCascade(
        tx,
        branch.id,
      );
    }

    // 3. Soft delete all Users
    await tx.user.deleteMany({
      where: { companyId },
    });

    // 4. Soft delete all PermissionTemplates
    await tx.permissionTemplate.deleteMany({
      where: { companyId },
    });

    // 5. Finally, soft delete the Company itself
    await tx.company.delete({
      where: { id: companyId },
    });
  }

  async remove(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Use transaction to ensure atomic cascade deletion
    await this.prisma.$transaction(async (tx) => {
      await this.softDeleteCompanyCascade(tx, id);
    });

    return { success: true };
  }

  private async validateSlugUniqueness(slug: string, excludeId?: string) {
    const existingCompany = await this.prisma.company.findUnique({
      where: { slug },
    });

    if (existingCompany && existingCompany.id !== excludeId) {
      throw FieldsErr({ slug: 'This slug is already in use' });
    }
  }

  async getAdminManagerUsers(
    companyId: string,
  ): Promise<AdminManagerUserResponseDto[]> {
    const users = await this.prisma.user.findMany({
      where: {
        companyId,
        isCompanyAdmin: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isCompanyAdmin: true,
      },
    });

    return users;
  }
}
