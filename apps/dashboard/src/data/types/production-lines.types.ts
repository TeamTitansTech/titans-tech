import type { Machine } from './machines.types';

export interface ProductionLine {
  id: string;
  name: string;
  branchId: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  branch?: {
    id: string;
    name: string;
    isMainBranch: boolean;
    location?: string;
    companyId: string;
  };
  machines?: ProductionLineMachine[];
  _count?: {
    machines: number;
  };
}

export interface ProductionLineMachine {
  productionLineId: string;
  machineId: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  machine?: MachineWithStatus;
}

export interface MachineWithStatus extends Machine {
  sectionStatus?: {
    [sectionName: string]: 'ok' | 'warning' | 'alert' | 'unknown';
  };
}

export interface CreateProductionLineDto {
  name: string;
  branchId: string;
  machineIds: string[];
  createdBy?: string;
}

export interface UpdateProductionLineDto {
  name?: string;
  branchId?: string;
  machineIds?: string[];
}
