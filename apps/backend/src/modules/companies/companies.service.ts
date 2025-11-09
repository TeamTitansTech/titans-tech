import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import { CreateCompanyDto, UpdateCompanyDto } from '@titans-tech/shared';
import { FieldsErr } from '../../errors/err';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.company.findMany({});
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async create(createCompanyDto: CreateCompanyDto) {
    await this.validateSlugUniqueness(createCompanyDto.slug);

    return this.prisma.company.create({
      data: createCompanyDto,
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
}
