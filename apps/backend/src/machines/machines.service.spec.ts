import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MachinesService } from './machines.service';
import { PrismaService } from '../prisma.service';
import {
  createMockPrismaService,
  MockPrismaService,
  resetPrismaMocks,
} from '../../test/prisma-mock';

describe('MachinesService', () => {
  let service: MachinesService;
  let prismaService: MockPrismaService;

  beforeEach(async () => {
    const mockPrisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MachinesService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<MachinesService>(MachinesService);
    prismaService = mockPrisma;
  });

  afterEach(() => {
    resetPrismaMocks(prismaService);
  });

  describe('create', () => {
    it('should create a machine successfully', async () => {
      const createDto = {
        name: 'Test Machine',
        blueprintId: 'bp-123',
        branchId: 'branch-123',
        fields: [
          { fieldSlug: 'serial-number', value: 'SN-001' },
          { fieldSlug: 'manufacturer', value: 'ACME' },
        ],
      };

      const mockBlueprint = {
        id: 'bp-123',
        name: 'Test Blueprint',
      };

      const mockBranch = {
        id: 'branch-123',
        name: 'Main Branch',
        companyId: 'company-123',
      };

      const mockCreatedMachine = {
        id: 'machine-123',
        name: 'Test Machine',
        blueprintId: 'bp-123',
        branchId: 'branch-123',
        blueprint: mockBlueprint,
        branch: mockBranch,
        fields: [
          { id: 'field-1', fieldSlug: 'serial-number', value: 'SN-001' },
          { id: 'field-2', fieldSlug: 'manufacturer', value: 'ACME' },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.blueprint.findUnique.mockResolvedValue(mockBlueprint);
      prismaService.companyBranch.findUnique.mockResolvedValue(mockBranch);
      prismaService.machine.create.mockResolvedValue(mockCreatedMachine);

      const result = await service.create(createDto);

      expect(result.id).toBe('machine-123');
      expect(result.name).toBe('Test Machine');
      expect(result.fields).toHaveLength(2);
      expect(prismaService.machine.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            blueprintId: 'bp-123',
            branchId: 'branch-123',
            name: 'Test Machine',
          }),
        }),
      );
    });

    it('should throw NotFoundException when blueprint not found', async () => {
      const createDto = {
        name: 'Test Machine',
        blueprintId: 'non-existent',
        branchId: 'branch-123',
        fields: [],
      };

      prismaService.blueprint.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when branch not found', async () => {
      const createDto = {
        name: 'Test Machine',
        blueprintId: 'bp-123',
        branchId: 'non-existent',
        fields: [],
      };

      const mockBlueprint = {
        id: 'bp-123',
        name: 'Test Blueprint',
      };

      prismaService.blueprint.findUnique.mockResolvedValue(mockBlueprint);
      prismaService.companyBranch.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all machines', async () => {
      const mockMachines = [
        {
          id: 'machine-1',
          name: 'Machine 1',
          blueprintId: 'bp-1',
          branchId: 'branch-1',
          blueprint: { id: 'bp-1', name: 'BP 1' },
          branch: { id: 'branch-1', name: 'Branch 1' },
          fields: [],
        },
        {
          id: 'machine-2',
          name: 'Machine 2',
          blueprintId: 'bp-1',
          branchId: 'branch-1',
          blueprint: { id: 'bp-1', name: 'BP 1' },
          branch: { id: 'branch-1', name: 'Branch 1' },
          fields: [],
        },
      ];

      prismaService.machine.findMany.mockResolvedValue(mockMachines);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(prismaService.machine.findMany).toHaveBeenCalledWith({
        include: {
          blueprint: true,
          branch: true,
          fields: true,
        },
      });
    });
  });

  describe('findByBranch', () => {
    it('should return machines for a specific branch', async () => {
      const mockMachines = [
        {
          id: 'machine-1',
          name: 'Machine 1',
          blueprintId: 'bp-1',
          branchId: 'branch-123',
          blueprint: { id: 'bp-1', name: 'BP 1' },
          branch: { id: 'branch-123', name: 'Branch' },
          fields: [],
        },
      ];

      prismaService.machine.findMany.mockResolvedValue(mockMachines);

      const result = await service.findByBranch('branch-123');

      expect(result).toHaveLength(1);
      expect(prismaService.machine.findMany).toHaveBeenCalledWith({
        where: { branchId: 'branch-123' },
        include: {
          blueprint: true,
          branch: true,
          fields: true,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a machine by id', async () => {
      const mockMachine = {
        id: 'machine-123',
        name: 'Test Machine',
        blueprintId: 'bp-1',
        branchId: 'branch-1',
        blueprint: { id: 'bp-1', name: 'BP 1' },
        branch: { id: 'branch-1', name: 'Branch 1' },
        fields: [],
        services: [],
      };

      prismaService.machine.findUnique.mockResolvedValue(mockMachine);

      const result = await service.findOne('machine-123');

      expect(result.id).toBe('machine-123');
      expect(prismaService.machine.findUnique).toHaveBeenCalledWith({
        where: { id: 'machine-123' },
        include: expect.objectContaining({
          blueprint: true,
          branch: true,
          fields: true,
          services: expect.any(Object),
        }),
      });
    });

    it('should throw NotFoundException when machine not found', async () => {
      prismaService.machine.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
