import type { Machine } from './machines.types';

export interface ProductionLine {
  id: string;
  name: string;
  companyId: string;
  branchId?: string;
  userId: string;
  machineIds: string[];
  machines?: MachineWithStatus[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    machines: number;
  };
}

export interface MachineWithStatus extends Machine {
  sectionStatus?: {
    [sectionName: string]: 'ok' | 'warning' | 'alert' | 'unknown';
  };
}

export interface CreateProductionLineDto {
  name: string;
}

export interface UpdateProductionLineDto {
  name?: string;
  companyId?: string;
  branchId?: string;
  machineIds?: string[];
}
