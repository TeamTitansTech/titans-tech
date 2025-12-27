import { PrismaClient } from '@titans-tech/db';
import { companyBranchesService } from './company-branches';

type TransactionClient = Parameters<Parameters<PrismaClient['$transaction']>[0]>[0];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const companiesService = {
  async findAll(prisma: PrismaClient) {
    return prisma.company.findMany({
      include: {
        _count: {
          select: {
            branches: true,
          },
        },
      },
    });
  },

  async findOne(prisma: PrismaClient, id: string) {
    return prisma.company.findUnique({
      where: { id },
      include: {
        _count: { select: { branches: true } },
      },
    });
  },

  async getCompanyPublicInfo(prisma: PrismaClient, companySlug: string) {
    return prisma.company.findUnique({
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
  },

  async create(prisma: PrismaClient, createCompanyDto: any) {
    const normalizedSlug = slugify(createCompanyDto.slug);

    if (!normalizedSlug) {
      throw {
        type: 'FIELDS_ERR',
        payload: { slug: 'Invalid slug - must contain alphanumeric characters' },
      };
    }

    return prisma.$transaction(async (tx) => {
      const existing = await tx.company.findUnique({ where: { slug: normalizedSlug } });
      if (existing) {
        throw { type: 'FIELDS_ERR', payload: { slug: 'This slug is already in use' } };
      }

      const company = await tx.company.create({
        data: { ...createCompanyDto, slug: normalizedSlug },
      });

      await tx.companyBranch.create({
        data: { name: createCompanyDto.name, isMainBranch: true, companyId: company.id },
      });

      return company;
    });
  },

  async update(prisma: PrismaClient, id: string, updateCompanyDto: any) {
    const company = await prisma.company.findUnique({ where: { id } });
    if (!company) return null;

    let normalizedSlug: string | undefined;
    if (updateCompanyDto.slug) {
      normalizedSlug = slugify(updateCompanyDto.slug);
      if (!normalizedSlug) {
        throw {
          type: 'FIELDS_ERR',
          payload: { slug: 'Invalid slug - must contain alphanumeric characters' },
        };
      }

      const existing = await prisma.company.findUnique({ where: { slug: normalizedSlug } });
      if (existing && existing.id !== id) {
        throw { type: 'FIELDS_ERR', payload: { slug: 'This slug is already in use' } };
      }
    }

    return prisma.company.update({
      where: { id },
      data: { ...updateCompanyDto, ...(normalizedSlug && { slug: normalizedSlug }) },
    });
  },

  /**
   * Soft delete cascade for company and all related entities
   * Handles: CompanyBranches -> Users -> PermissionTemplates -> Company
   */
  async softDeleteCascade(tx: TransactionClient, companyId: string): Promise<void> {
    // 1. Get all branches
    const branches = await tx.companyBranch.findMany({
      where: { companyId },
      select: { id: true },
    });

    // 2. Soft delete all branches (reuses companyBranchesService cascade)
    for (const branch of branches) {
      await companyBranchesService.softDeleteCascade(tx, branch.id);
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
  },

  async remove(prisma: PrismaClient, id: string) {
    const company = await prisma.company.findUnique({ where: { id } });
    if (!company) return null;

    await prisma.$transaction(async (tx) => {
      await companiesService.softDeleteCascade(tx, id);
    });

    return true;
  },

  async validateSlugUniqueness(prisma: PrismaClient, slug: string, excludeId?: string) {
    const existing = await prisma.company.findUnique({ where: { slug } });
    return !(existing && existing.id !== excludeId);
  },

  async getAdminManagerUsers(prisma: PrismaClient, companyId: string) {
    return prisma.user.findMany({
      where: { companyId, isCompanyAdmin: true },
      select: { id: true, name: true, email: true, isCompanyAdmin: true },
    });
  },
};

export default companiesService;
