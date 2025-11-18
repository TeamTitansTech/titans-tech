/**
 * Mock utilities for PrismaService in tests
 *
 * Usage:
 * ```ts
 * const { module, prismaService } = await createTestingModule([AlertsService]);
 * prismaService.thresholdBearingClearance.findUnique.mockResolvedValue(mockThreshold);
 * ```
 */

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../src/prisma.service';
import { Type } from '@nestjs/common';

/**
 * Creates a mock PrismaService with all methods mocked
 */
export function createMockPrismaService() {
  return {
    // Threshold methods
    thresholdBearingClearance: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    // Alert methods
    alertBearingClearance: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    // Machine Service methods
    machineService: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    // Machine methods
    machine: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    // Blueprint methods
    blueprint: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    // Company methods
    company: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    // User methods
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    // SysAdmin methods
    sysAdmin: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    // Connection methods
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    onModuleInit: jest.fn(),
    onModuleDestroy: jest.fn(),
  };
}

export type MockPrismaService = ReturnType<typeof createMockPrismaService>;

/**
 * Helper to create a testing module with providers and mocked PrismaService
 */
export async function createTestingModule(
  providers: Type<any>[],
  additionalProviders: any[] = [],
): Promise<{
  module: TestingModule;
  prismaService: MockPrismaService;
}> {
  const mockPrisma = createMockPrismaService();

  const module = await Test.createTestingModule({
    providers: [
      ...providers,
      {
        provide: PrismaService,
        useValue: mockPrisma,
      },
      ...additionalProviders,
    ],
  }).compile();

  return {
    module,
    prismaService: mockPrisma,
  };
}

/**
 * Reset all mock functions in the prisma service
 */
export function resetPrismaMocks(prismaService: MockPrismaService | undefined) {
  if (!prismaService) return;

  Object.values(prismaService).forEach((model) => {
    if (typeof model === 'object' && model !== null) {
      Object.values(model).forEach((method) => {
        if (typeof method === 'function' && 'mockReset' in method) {
          (method as jest.Mock).mockReset();
        }
      });
    }
  });
}
