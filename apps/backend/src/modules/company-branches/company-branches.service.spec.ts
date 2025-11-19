import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CompanyBranchesService } from './company-branches.service';
import { PrismaService } from '../shared/prisma.service';
import {
  createMockPrismaService,
  MockPrismaService,
  resetPrismaMocks,
} from '../../../test/prisma-mock';

// Mock @titans-tech/shared
jest.mock('@titans-tech/shared', () => ({
  UserResponseDto: jest.fn().mockImplementation((data) => ({
    id: data?.id,
    email: data?.email,
    name: data?.name,
    companyId: data?.companyId,
    isCompanyAdmin: data?.isCompanyAdmin,
    isCompanyManager: data?.isCompanyManager,
    branches: data?.branches || [],
  })),
  CreateCompanyBranchDto: jest.fn(),
  UpdateCompanyBranchDto: jest.fn(),
  SetUserPermissionsDto: jest.fn(),
}));

describe('CompanyBranchesService', () => {
  let service: CompanyBranchesService;
  let prismaService: MockPrismaService;

  beforeEach(async () => {
    const mockPrisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyBranchesService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<CompanyBranchesService>(CompanyBranchesService);
    prismaService = mockPrisma;
  });

  afterEach(() => {
    resetPrismaMocks(prismaService);
  });

  describe('findAll', () => {
    it('should return all branches for a company', async () => {
      const mockBranches = [
        {
          id: 'branch-1',
          name: 'Main Branch',
          isMainBranch: true,
          companyId: 'company-123',
          location: 'Location 1',
          _count: { machines: 5 },
        },
        {
          id: 'branch-2',
          name: 'Secondary Branch',
          isMainBranch: false,
          companyId: 'company-123',
          location: 'Location 2',
          _count: { machines: 3 },
        },
      ];

      prismaService.companyBranch.findMany.mockResolvedValue(mockBranches);

      const result = await service.findAll('company-123');

      expect(result).toHaveLength(2);
      expect(prismaService.companyBranch.findMany).toHaveBeenCalledWith({
        where: { companyId: 'company-123' },
        include: {
          _count: {
            select: { machines: true },
          },
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a branch by id', async () => {
      const mockBranch = {
        id: 'branch-123',
        name: 'Test Branch',
        isMainBranch: true,
        companyId: 'company-123',
        location: 'Test Location',
        _count: { machines: 10 },
      };

      prismaService.companyBranch.findUnique.mockResolvedValue(mockBranch);

      const result = await service.findOne('branch-123');

      expect(result.id).toBe('branch-123');
      expect(prismaService.companyBranch.findUnique).toHaveBeenCalledWith({
        where: { id: 'branch-123' },
        include: {
          _count: {
            select: { machines: true },
          },
        },
      });
    });

    it('should throw NotFoundException when branch not found', async () => {
      prismaService.companyBranch.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a branch successfully', async () => {
      const createDto = {
        name: 'New Branch',
        location: 'New Location',
        isMainBranch: false,
      };

      const mockBranch = {
        id: 'branch-123',
        name: 'New Branch',
        location: 'New Location',
        isMainBranch: false,
        companyId: 'company-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.companyBranch.create.mockResolvedValue(mockBranch);

      const result = await service.create('company-123', createDto);

      expect(result.id).toBe('branch-123');
      expect(result.name).toBe('New Branch');
      expect(prismaService.companyBranch.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          companyId: 'company-123',
        },
      });
    });

    it('should unset other main branches when creating a new main branch', async () => {
      const createDto = {
        name: 'New Main Branch',
        location: 'New Location',
        isMainBranch: true,
      };

      const mockBranch = {
        id: 'branch-123',
        name: 'New Main Branch',
        location: 'New Location',
        isMainBranch: true,
        companyId: 'company-123',
      };

      const updateManyMock = jest.fn();
      const createMock = jest.fn().mockResolvedValue(mockBranch);

      prismaService.$transaction.mockImplementation(async (callback) => {
        const txMock = {
          companyBranch: {
            updateMany: updateManyMock,
            create: createMock,
          },
        };
        return callback(txMock);
      });

      const result = await service.create('company-123', createDto);

      expect(result.isMainBranch).toBe(true);
      expect(updateManyMock).toHaveBeenCalledWith({
        where: {
          companyId: 'company-123',
          isMainBranch: true,
        },
        data: { isMainBranch: false },
      });
    });
  });

  describe('update', () => {
    it('should update a branch successfully', async () => {
      const updateDto = {
        name: 'Updated Branch',
        location: 'Updated Location',
      };

      const mockBranch = {
        id: 'branch-123',
        name: 'Original Branch',
        location: 'Original Location',
        isMainBranch: false,
        companyId: 'company-123',
      };

      const updatedBranch = {
        ...mockBranch,
        name: 'Updated Branch',
        location: 'Updated Location',
      };

      prismaService.companyBranch.findUnique.mockResolvedValue(mockBranch);
      prismaService.companyBranch.update.mockResolvedValue(updatedBranch);

      const result = await service.update('branch-123', updateDto);

      expect(result.name).toBe('Updated Branch');
      expect(prismaService.companyBranch.update).toHaveBeenCalledWith({
        where: { id: 'branch-123' },
        data: updateDto,
      });
    });

    it('should throw NotFoundException when branch not found', async () => {
      prismaService.companyBranch.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent', { name: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should unset other main branches when setting as main', async () => {
      const updateDto = {
        isMainBranch: true,
      };

      const mockBranch = {
        id: 'branch-123',
        name: 'Branch',
        isMainBranch: false,
        companyId: 'company-123',
      };

      const updatedBranch = {
        ...mockBranch,
        isMainBranch: true,
      };

      prismaService.companyBranch.findUnique.mockResolvedValue(mockBranch);

      const updateManyMock = jest.fn();
      const updateMock = jest.fn().mockResolvedValue(updatedBranch);

      prismaService.$transaction.mockImplementation(async (callback) => {
        const txMock = {
          companyBranch: {
            updateMany: updateManyMock,
            update: updateMock,
          },
        };
        return callback(txMock);
      });

      const result = await service.update('branch-123', updateDto);

      expect(result.isMainBranch).toBe(true);
      expect(updateManyMock).toHaveBeenCalledWith({
        where: {
          companyId: 'company-123',
          isMainBranch: true,
          NOT: { id: 'branch-123' },
        },
        data: { isMainBranch: false },
      });
    });
  });

  describe('remove', () => {
    it('should delete a branch successfully', async () => {
      const mockBranch = {
        id: 'branch-123',
        name: 'Test Branch',
        companyId: 'company-123',
      };

      prismaService.companyBranch.findUnique.mockResolvedValue(mockBranch);
      prismaService.companyBranch.delete.mockResolvedValue(mockBranch);

      const result = await service.remove('branch-123');

      expect(result).toEqual({ success: true });
      expect(prismaService.companyBranch.delete).toHaveBeenCalledWith({
        where: { id: 'branch-123' },
      });
    });

    it('should throw NotFoundException when branch not found', async () => {
      prismaService.companyBranch.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getMachines', () => {
    it('should return machines for a branch', async () => {
      const mockBranch = {
        id: 'branch-123',
        name: 'Test Branch',
        machines: [
          {
            id: 'machine-1',
            name: 'Machine 1',
            blueprint: { id: 'bp-1', name: 'BP 1' },
            fields: [],
          },
          {
            id: 'machine-2',
            name: 'Machine 2',
            blueprint: { id: 'bp-1', name: 'BP 1' },
            fields: [],
          },
        ],
      };

      prismaService.companyBranch.findUnique.mockResolvedValue(mockBranch);

      const result = await service.getMachines('branch-123');

      expect(result).toHaveLength(2);
      expect(prismaService.companyBranch.findUnique).toHaveBeenCalledWith({
        where: { id: 'branch-123' },
        include: {
          machines: {
            include: {
              blueprint: true,
              fields: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException when branch not found', async () => {
      prismaService.companyBranch.findUnique.mockResolvedValue(null);

      await expect(service.getMachines('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('setUserPermissions', () => {
    it('should update user permissions for a branch', async () => {
      const permissionsDto = {
        readMachines: true,
        createMachines: true,
        deleteMachines: false,
      };

      const mockUserBranch = {
        userId: 'user-123',
        branchId: 'branch-123',
      };

      const mockUpdatedUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        branches: [
          {
            branch: { id: 'branch-123', name: 'Branch' },
            ...permissionsDto,
          },
        ],
      };

      prismaService.userBranch.findUnique.mockResolvedValue(mockUserBranch);
      prismaService.userBranch.update.mockResolvedValue({});
      prismaService.user.findUnique.mockResolvedValue(mockUpdatedUser);

      const result = await service.setUserPermissions(
        'branch-123',
        'user-123',
        permissionsDto,
      );

      expect(result).toBeDefined();
      expect(prismaService.userBranch.update).toHaveBeenCalledWith({
        where: {
          userId_branchId: {
            userId: 'user-123',
            branchId: 'branch-123',
          },
        },
        data: permissionsDto,
      });
    });

    it('should throw NotFoundException when user is not assigned to branch', async () => {
      prismaService.userBranch.findUnique.mockResolvedValue(null);

      await expect(
        service.setUserPermissions('branch-123', 'user-123', {}),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
