/**
 * Factory functions for creating test data
 */

import { Decimal } from '@prisma/client/runtime/library';

/**
 * Creates a valid threshold object for testing
 */
export function createMockThreshold(
  overrides: Partial<{
    blueprintId: string;
    totalClearance_greenMin: number;
    totalClearance_yellowMin: number;
    totalClearance_redMin: number;
    mainBearings_greenMin: number;
    mainBearings_yellowMin: number;
    mainBearings_redMin: number;
    upperConnectionBearings_greenMin: number;
    upperConnectionBearings_yellowMin: number;
    upperConnectionBearings_redMin: number;
    wristPinToMatingPart_greenMin: number;
    wristPinToMatingPart_yellowMin: number;
    wristPinToMatingPart_redMin: number;
    wristPinToBushing_greenMin: number;
    wristPinToBushing_yellowMin: number;
    wristPinToBushing_redMin: number;
    slideAdjNutToScrewSleeve_greenMin: number;
    slideAdjNutToScrewSleeve_yellowMin: number;
    slideAdjNutToScrewSleeve_redMin: number;
  }> = {},
) {
  const defaults = {
    blueprintId: 'blueprint-123',
    totalClearance_greenMin: 0.01,
    totalClearance_yellowMin: 0.02,
    totalClearance_redMin: 0.03,
    mainBearings_greenMin: 0.01,
    mainBearings_yellowMin: 0.02,
    mainBearings_redMin: 0.03,
    upperConnectionBearings_greenMin: 0.01,
    upperConnectionBearings_yellowMin: 0.02,
    upperConnectionBearings_redMin: 0.03,
    wristPinToMatingPart_greenMin: 0.01,
    wristPinToMatingPart_yellowMin: 0.02,
    wristPinToMatingPart_redMin: 0.03,
    wristPinToBushing_greenMin: 0.01,
    wristPinToBushing_yellowMin: 0.02,
    wristPinToBushing_redMin: 0.03,
    slideAdjNutToScrewSleeve_greenMin: 0.01,
    slideAdjNutToScrewSleeve_yellowMin: 0.02,
    slideAdjNutToScrewSleeve_redMin: 0.03,
  };

  return { ...defaults, ...overrides };
}

/**
 * Creates a threshold object with Decimal values (as returned from DB)
 */
export function createMockThresholdWithDecimals(
  overrides: Partial<{
    blueprintId: string;
    totalClearance_greenMin: number;
    totalClearance_yellowMin: number;
    totalClearance_redMin: number;
    mainBearings_greenMin: number;
    mainBearings_yellowMin: number;
    mainBearings_redMin: number;
    upperConnectionBearings_greenMin: number;
    upperConnectionBearings_yellowMin: number;
    upperConnectionBearings_redMin: number;
    wristPinToMatingPart_greenMin: number;
    wristPinToMatingPart_yellowMin: number;
    wristPinToMatingPart_redMin: number;
    wristPinToBushing_greenMin: number;
    wristPinToBushing_yellowMin: number;
    wristPinToBushing_redMin: number;
    slideAdjNutToScrewSleeve_greenMin: number;
    slideAdjNutToScrewSleeve_yellowMin: number;
    slideAdjNutToScrewSleeve_redMin: number;
  }> = {},
) {
  const data = createMockThreshold(overrides);

  return {
    id: 'threshold-123',
    blueprintId: data.blueprintId,
    totalClearance_greenMin: new Decimal(data.totalClearance_greenMin),
    totalClearance_yellowMin: new Decimal(data.totalClearance_yellowMin),
    totalClearance_redMin: new Decimal(data.totalClearance_redMin),
    mainBearings_greenMin: new Decimal(data.mainBearings_greenMin),
    mainBearings_yellowMin: new Decimal(data.mainBearings_yellowMin),
    mainBearings_redMin: new Decimal(data.mainBearings_redMin),
    upperConnectionBearings_greenMin: new Decimal(
      data.upperConnectionBearings_greenMin,
    ),
    upperConnectionBearings_yellowMin: new Decimal(
      data.upperConnectionBearings_yellowMin,
    ),
    upperConnectionBearings_redMin: new Decimal(
      data.upperConnectionBearings_redMin,
    ),
    wristPinToMatingPart_greenMin: new Decimal(
      data.wristPinToMatingPart_greenMin,
    ),
    wristPinToMatingPart_yellowMin: new Decimal(
      data.wristPinToMatingPart_yellowMin,
    ),
    wristPinToMatingPart_redMin: new Decimal(data.wristPinToMatingPart_redMin),
    wristPinToBushing_greenMin: new Decimal(data.wristPinToBushing_greenMin),
    wristPinToBushing_yellowMin: new Decimal(data.wristPinToBushing_yellowMin),
    wristPinToBushing_redMin: new Decimal(data.wristPinToBushing_redMin),
    slideAdjNutToScrewSleeve_greenMin: new Decimal(
      data.slideAdjNutToScrewSleeve_greenMin,
    ),
    slideAdjNutToScrewSleeve_yellowMin: new Decimal(
      data.slideAdjNutToScrewSleeve_yellowMin,
    ),
    slideAdjNutToScrewSleeve_redMin: new Decimal(
      data.slideAdjNutToScrewSleeve_redMin,
    ),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Creates mock bearing clearance data
 */
export function createMockBearingClearanceData(
  overrides: Partial<{
    totalClearance_RH: number;
    totalClearance_LH: number;
    mainBearings_RH: number;
    mainBearings_LH: number;
    upperConnectionBearings_RH: number;
    upperConnectionBearings_LH: number;
    wristPinToMatingPart_RH: number;
    wristPinToMatingPart_LH: number;
    wristPinToBushing_RH: number;
    wristPinToBushing_LH: number;
    slideAdjNutToScrewSleeve_RH: number;
    slideAdjNutToScrewSleeve_LH: number;
  }> = {},
) {
  const defaults = {
    totalClearance_RH: 0.015,
    totalClearance_LH: 0.01,
    mainBearings_RH: 0.015,
    mainBearings_LH: 0.01,
    upperConnectionBearings_RH: 0.015,
    upperConnectionBearings_LH: 0.01,
    wristPinToMatingPart_RH: 0.015,
    wristPinToMatingPart_LH: 0.01,
    wristPinToBushing_RH: 0.015,
    wristPinToBushing_LH: 0.01,
    slideAdjNutToScrewSleeve_RH: 0.015,
    slideAdjNutToScrewSleeve_LH: 0.01,
  };

  const data = { ...defaults, ...overrides };

  return {
    id: 'bearing-data-123',
    totalClearance_RH: new Decimal(data.totalClearance_RH),
    totalClearance_LH: new Decimal(data.totalClearance_LH),
    mainBearings_RH: new Decimal(data.mainBearings_RH),
    mainBearings_LH: new Decimal(data.mainBearings_LH),
    upperConnectionBearings_RH: new Decimal(data.upperConnectionBearings_RH),
    upperConnectionBearings_LH: new Decimal(data.upperConnectionBearings_LH),
    wristPinToMatingPart_RH: new Decimal(data.wristPinToMatingPart_RH),
    wristPinToMatingPart_LH: new Decimal(data.wristPinToMatingPart_LH),
    wristPinToBushing_RH: new Decimal(data.wristPinToBushing_RH),
    wristPinToBushing_LH: new Decimal(data.wristPinToBushing_LH),
    slideAdjNutToScrewSleeve_RH: new Decimal(data.slideAdjNutToScrewSleeve_RH),
    slideAdjNutToScrewSleeve_LH: new Decimal(data.slideAdjNutToScrewSleeve_LH),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Creates a mock machine service with all related data
 */
export function createMockMachineService(
  overrides: {
    id?: string;
    machineId?: string;
    blueprintId?: string;
    thresholdBearingClearance?: ReturnType<
      typeof createMockThresholdWithDecimals
    > | null;
    bearingClearanceData?: ReturnType<
      typeof createMockBearingClearanceData
    > | null;
  } = {},
) {
  const id = overrides.id || 'service-123';
  const machineId = overrides.machineId || 'machine-123';
  const blueprintId = overrides.blueprintId || 'blueprint-123';

  return {
    id,
    machineId,
    date: new Date(),
    type: 'INSPECTION',
    status: 'PENDING',
    performedBy: null,
    currentStep: null,
    currentSectionKey: null,
    selectedSections: null,
    completedSections: null,
    lastSectionSavedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    machine: {
      id: machineId,
      name: 'Test Machine',
      blueprintId,
      branchId: 'branch-123',
      blueprint: {
        id: blueprintId,
        name: 'Test Blueprint',
        sections: ['BEARING_CLEARANCE'],
        thresholdBearingClearance:
          'thresholdBearingClearance' in overrides
            ? overrides.thresholdBearingClearance
            : createMockThresholdWithDecimals({ blueprintId }),
      },
    },
    bearingClearance: overrides.bearingClearanceData
      ? [
          {
            id: 'bearing-clearance-123',
            machineServiceId: id,
            outerData: overrides.bearingClearanceData,
            innerData: null,
            outerBefore: null,
            innerBefore: null,
          },
        ]
      : [],
  };
}
