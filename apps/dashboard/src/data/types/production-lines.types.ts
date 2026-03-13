import type { Machine } from './machines.types';

export type ProductionLineDirection = 'LEFT_TO_RIGHT' | 'RIGHT_TO_LEFT';

// Canvas shape types for Konva drawing
export interface CanvasShape {
  id: string;
  type: 'line' | 'rectangle' | 'circle' | 'arrow' | 'text';
  x: number;
  y: number;
  stroke: string;
  strokeWidth: number;
  points?: number[];
  width?: number;
  height?: number;
  radius?: number;
  text?: string;
  fontSize?: number;
  fill?: string;
}

export interface ProductionLine {
  id: string;
  name: string;
  branchId: string;
  createdBy?: string;
  direction: ProductionLineDirection;
  canvasShapes?: CanvasShape[];
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
  positionX?: number | null;
  positionY?: number | null;
  addedAt: string;
  machine?: MachineWithStatus;
}

export interface MachineWithStatus extends Machine {
  sectionStatus?: {
    [sectionName: string]: 'ok' | 'warning' | 'alert';
  };
}

export interface CreateProductionLineDto {
  name: string;
  branchId: string;
  machineIds: string[];
  direction?: ProductionLineDirection;
  createdBy?: string;
}

export interface UpdateProductionLineDto {
  name?: string;
  machineIds?: string[];
  direction?: ProductionLineDirection;
}

// DTOs for updating positions and canvas shapes
export interface UpdateNodePositionsDto {
  positions: Array<{
    machineId: string;
    positionX: number;
    positionY: number;
  }>;
}

export interface UpdateCanvasShapesDto {
  shapes: CanvasShape[];
}
