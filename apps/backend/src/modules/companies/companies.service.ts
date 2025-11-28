import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import {
  CreateCompanyDto,
  UpdateCompanyDto,
  AdminManagerUserResponseDto,
} from '@titans-tech/shared/backend-dtos';
import { FieldsErr } from '../../errors/err';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

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
        brandColor: true,
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async create(createCompanyDto: CreateCompanyDto) {
    await this.validateSlugUniqueness(createCompanyDto.slug);

    return this.prisma.$transaction(async (tx) => {
      // Create the company
      const company = await tx.company.create({
        data: createCompanyDto,
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

    if (updateCompanyDto.slug) {
      await this.validateSlugUniqueness(updateCompanyDto.slug, id);
    }

    return this.prisma.company.update({
      where: { id },
      data: updateCompanyDto,
    });
  }

  async remove(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    await this.prisma.company.delete({
      where: { id },
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
        OR: [{ isCompanyAdmin: true }, { isCompanyManager: true }],
      },
      select: {
        id: true,
        name: true,
        email: true,
        isCompanyAdmin: true,
        isCompanyManager: true,
      },
    });

    return users;
  }
}
