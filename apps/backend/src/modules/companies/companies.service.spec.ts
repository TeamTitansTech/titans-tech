import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { PrismaService } from '../shared/prisma.service';
import {
  createMockPrismaService,
  MockPrismaService,
  resetPrismaMocks,
} from '../../../test/prisma-mock';
import { Err } from '../../../src/errors/err';

describe('CompaniesService', () => {
  let service: CompaniesService;
  let prismaService: MockPrismaService;

  beforeEach(async () => {
    const mockPrisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
    prismaService = mockPrisma;
  });

  afterEach(() => {
    resetPrismaMocks(prismaService);
  });

  describe('findAll', () => {
    it('should return all companies with branch count', async () => {
      const mockCompanies = [
        {
          id: 'company-1',
          name: 'Company 1',
          slug: 'company-1',
          logo: null,
          brandColor: null,
          description: null,
          _count: { branches: 3 },
        },
        {
          id: 'company-2',
          name: 'Company 2',
          slug: 'company-2',
          logo: null,
          brandColor: null,
          description: null,
          _count: { branches: 1 },
        },
      ];

      prismaService.company.findMany.mockResolvedValue(mockCompanies);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(prismaService.company.findMany).toHaveBeenCalledWith({
        include: {
          _count: {
            select: { branches: true },
          },
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a company by id', async () => {
      const mockCompany = {
        id: 'company-123',
        name: 'Test Company',
        slug: 'test-company',
        logo: null,
        brandColor: '#000000',
        description: 'Test description',
        _count: { branches: 2 },
      };

      prismaService.company.findUnique.mockResolvedValue(mockCompany);

      const result = await service.findOne('company-123');

      expect(result.id).toBe('company-123');
      expect(prismaService.company.findUnique).toHaveBeenCalledWith({
        where: { id: 'company-123' },
        include: {
          _count: {
            select: { branches: true },
          },
        },
      });
    });

    it('should throw NotFoundException when company not found', async () => {
      prismaService.company.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getCompanyPublicInfo', () => {
    it('should return public company info by slug', async () => {
      const mockCompany = {
        id: 'company-123',
        slug: 'test-company',
        name: 'Test Company',
        logo: 'logo.png',
        brandColor: '#FF0000',
      };

      prismaService.company.findUnique.mockResolvedValue(mockCompany);

      const result = await service.getCompanyPublicInfo('test-company');

      expect(result.slug).toBe('test-company');
      expect(result.name).toBe('Test Company');
      expect(prismaService.company.findUnique).toHaveBeenCalledWith({
        where: { slug: 'test-company' },
        select: {
          id: true,
          slug: true,
          name: true,
          logo: true,
          brandColor: true,
        },
      });
    });

    it('should throw NotFoundException when company not found by slug', async () => {
      prismaService.company.findUnique.mockResolvedValue(null);

      await expect(
        service.getCompanyPublicInfo('non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a company with main branch', async () => {
      const createDto = {
        name: 'New Company',
        slug: 'new-company',
        description: 'Description',
      };

      const mockCompany = {
        id: 'company-123',
        name: 'New Company',
        slug: 'new-company',
        description: 'Description',
        logo: null,
        brandColor: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock that slug is not in use
      prismaService.company.findUnique.mockResolvedValue(null);

      // Mock transaction
      prismaService.$transaction.mockImplementation(async (callback) => {
        const txMock = {
          company: {
            create: jest.fn().mockResolvedValue(mockCompany),
          },
          companyBranch: {
            create: jest.fn().mockResolvedValue({
              id: 'branch-123',
              name: 'New Company',
              isMainBranch: true,
              companyId: 'company-123',
            }),
          },
        };
        return callback(txMock);
      });

      const result = await service.create(createDto);

      expect(result.id).toBe('company-123');
      expect(result.slug).toBe('new-company');
    });

    it('should throw error when slug is already in use', async () => {
      const createDto = {
        name: 'New Company',
        slug: 'existing-slug',
      };

      const existingCompany = {
        id: 'company-existing',
        slug: 'existing-slug',
        name: 'Existing Company',
      };

      prismaService.company.findUnique.mockResolvedValue(existingCompany);

      await expect(service.create(createDto)).rejects.toThrow(Err);
    });
  });

  describe('update', () => {
    it('should update a company successfully', async () => {
      const updateDto = {
        name: 'Updated Company',
        description: 'Updated description',
      };

      const mockCompany = {
        id: 'company-123',
        name: 'Original Company',
        slug: 'original-company',
        description: 'Original description',
        logo: null,
        brandColor: null,
      };

      const updatedCompany = {
        ...mockCompany,
        name: 'Updated Company',
        description: 'Updated description',
      };

      prismaService.company.findUnique.mockResolvedValue(mockCompany);
      prismaService.company.update.mockResolvedValue(updatedCompany);

      const result = await service.update('company-123', updateDto);

      expect(result.name).toBe('Updated Company');
      expect(prismaService.company.update).toHaveBeenCalledWith({
        where: { id: 'company-123' },
        data: updateDto,
      });
    });

    it('should throw NotFoundException when company not found', async () => {
      prismaService.company.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent', { name: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should validate slug uniqueness on update', async () => {
      const updateDto = {
        slug: 'existing-slug',
      };

      const mockCompany = {
        id: 'company-123',
        name: 'Original Company',
        slug: 'original-company',
      };

      const existingCompany = {
        id: 'company-other',
        slug: 'existing-slug',
        name: 'Other Company',
      };

      // First call for finding the company to update
      prismaService.company.findUnique
        .mockResolvedValueOnce(mockCompany)
        // Second call for checking slug uniqueness
        .mockResolvedValueOnce(existingCompany);

      await expect(service.update('company-123', updateDto)).rejects.toThrow(
        Err,
      );
    });
  });

  describe('remove', () => {
    it('should delete a company successfully', async () => {
      const mockCompany = {
        id: 'company-123',
        name: 'Test Company',
        slug: 'test-company',
      };

      prismaService.company.findUnique.mockResolvedValue(mockCompany);
      prismaService.company.delete.mockResolvedValue(mockCompany);

      const result = await service.remove('company-123');

      expect(result).toEqual({ success: true });
      expect(prismaService.company.delete).toHaveBeenCalledWith({
        where: { id: 'company-123' },
      });
    });

    it('should throw NotFoundException when company not found', async () => {
      prismaService.company.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
