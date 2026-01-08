import type { Machine } from './machines.types';
import type { Node, Edge } from '@xyflow/react';

export type ProductionLineDirection = 'LEFT_TO_RIGHT' | 'RIGHT_TO_LEFT';

export interface ProductionLineEdge {
  id: string;
  productionLineId: string;
  sourceNodeId: string;
  targetNodeId: string;
  createdAt: string;
  updatedAt: string;
}

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
  edges?: ProductionLineEdge[];
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

// React Flow node data type
export interface MachineNodeData extends Record<string, unknown> {
  machine: MachineWithStatus;
  canViewDetails: boolean;
  sections: string[];
  connectMode?: boolean;
  isConnectedToBackbone?: boolean;
  onToggleBackboneConnection?: (machineId: string, positionX: number, positionY: number) => void;
}

// Type for React Flow nodes
export type MachineNode = Node<MachineNodeData, 'machine'>;

// Type for React Flow edges
export type ProductionLineFlowEdge = Edge;

// DTOs for updating positions and edges
export interface UpdateNodePositionsDto {
  positions: Array<{
    machineId: string;
    positionX: number;
    positionY: number;
  }>;
}

export interface UpdateEdgesDto {
  edges: Array<{
    sourceNodeId: string;
    targetNodeId: string;
  }>;
}

export interface UpdateCanvasShapesDto {
  shapes: CanvasShape[];
}
