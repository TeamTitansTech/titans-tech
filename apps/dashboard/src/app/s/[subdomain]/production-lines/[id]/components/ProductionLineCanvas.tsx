'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useViewport,
  type Connection,
  type Node,
  type Edge,
  ConnectionMode,
  Panel,
  type NodeChange,
  type EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Save, RotateCcw, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MachineNode } from './MachineNode';
import { updateNodePositions, updateEdges } from '@/data/services/production-lines.api';
import type {
  ProductionLine,
  MachineNodeData,
  ProductionLineMachine,
} from '@/data/types/production-lines.types';

// Custom node types
const nodeTypes = {
  machine: MachineNode,
};

// Auto-layout constants
const NODE_WIDTH = 200;
const NODE_HEIGHT = 350;
const HORIZONTAL_SPACING = 80;
const VERTICAL_SPACING = 100;
const NODES_PER_ROW = 4;

// Backbone connector component - draws central line connecting all machines
function BackboneConnector({ nodes }: { nodes: Node<MachineNodeData>[] }) {
  const viewport = useViewport();

  if (nodes.length < 2) return null;

  // Group nodes by rows (similar Y positions within threshold)
  const ROW_THRESHOLD = 100;
  const rows: Node<MachineNodeData>[][] = [];

  const sortedByY = [...nodes].sort((a, b) => a.position.y - b.position.y);

  sortedByY.forEach((node) => {
    const existingRow = rows.find(
      (row) => Math.abs(row[0].position.y - node.position.y) < ROW_THRESHOLD,
    );
    if (existingRow) {
      existingRow.push(node);
    } else {
      rows.push([node]);
    }
  });

  // Sort nodes within each row by X position
  rows.forEach((row) => row.sort((a, b) => a.position.x - b.position.x));

  // Calculate backbone line Y position (between rows)
  const rowCenters = rows.map((row) => {
    const avgY = row.reduce((sum, n) => sum + n.position.y, 0) / row.length;
    return avgY + NODE_HEIGHT / 2;
  });

  // Calculate the backbone Y position (midpoint between row centers, or below single row)
  let backboneY: number;
  if (rows.length === 1) {
    backboneY = rowCenters[0] + NODE_HEIGHT / 2 + 20;
  } else {
    backboneY = (rowCenters[0] + rowCenters[rowCenters.length - 1]) / 2;
  }

  // Find the leftmost and rightmost X positions
  const allX = nodes.map((n) => n.position.x + NODE_WIDTH / 2);
  const minX = Math.min(...allX) - 30;
  const maxX = Math.max(...allX) + 30;

  // Transform coordinates to screen space
  const transform = `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`;

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
        zIndex: 0,
      }}
    >
      <g style={{ transform, transformOrigin: '0 0' }}>
        {/* Main horizontal backbone line */}
        <line
          x1={minX}
          y1={backboneY}
          x2={maxX}
          y2={backboneY}
          stroke="#22c55e"
          strokeWidth={3}
          strokeDasharray="8 4"
        />

        {/* Vertical connectors from each node to backbone */}
        {nodes.map((node) => {
          const nodeCenter = node.position.x + NODE_WIDTH / 2;
          const nodeBottom = node.position.y + NODE_HEIGHT;
          const nodeTop = node.position.y;

          // Connect from top or bottom depending on position relative to backbone
          const connectY = nodeBottom < backboneY ? nodeBottom : nodeTop;

          return (
            <line
              key={node.id}
              x1={nodeCenter}
              y1={connectY}
              x2={nodeCenter}
              y2={backboneY}
              stroke="#22c55e"
              strokeWidth={2}
              strokeDasharray="6 3"
            />
          );
        })}
      </g>
    </svg>
  );
}

interface ProductionLineCanvasProps {
  productionLine: ProductionLine;
  canViewMachineDetails?: boolean;
  canEdit?: boolean;
}

function calculateAutoLayout(machines: ProductionLineMachine[]): { x: number; y: number }[] {
  return machines.map((_, index) => {
    const row = Math.floor(index / NODES_PER_ROW);
    const col = index % NODES_PER_ROW;

    // Offset odd rows for a staggered layout
    const xOffset = row % 2 === 1 ? (NODE_WIDTH + HORIZONTAL_SPACING) / 2 : 0;

    return {
      x: col * (NODE_WIDTH + HORIZONTAL_SPACING) + xOffset,
      y: row * (NODE_HEIGHT + VERTICAL_SPACING),
    };
  });
}

export function ProductionLineCanvas({
  productionLine,
  canViewMachineDetails = true,
  canEdit = false,
}: ProductionLineCanvasProps) {
  const t = useTranslations('productionLines');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showEdges, setShowEdges] = useState(true);

  // Convert production line data to React Flow nodes
  const initialNodes = useMemo(() => {
    const machines = productionLine.machines || [];
    const autoPositions = calculateAutoLayout(machines);

    return machines.map((pm, index): Node<MachineNodeData> => {
      const hasPosition = pm.positionX != null && pm.positionY != null;
      const position = hasPosition ? { x: pm.positionX!, y: pm.positionY! } : autoPositions[index];

      return {
        id: pm.machineId,
        type: 'machine',
        position,
        data: {
          machine: pm.machine!,
          canViewDetails: canViewMachineDetails,
          sections: pm.machine?.blueprint?.sections || [],
        },
        draggable: canEdit,
      };
    });
  }, [productionLine.machines, canViewMachineDetails, canEdit]);

  // Convert production line edges to React Flow edges
  const initialEdges = useMemo(() => {
    return (productionLine.edges || []).map(
      (edge): Edge => ({
        id: edge.id,
        source: edge.sourceNodeId,
        target: edge.targetNodeId,
        type: 'smoothstep',
        style: { stroke: '#22c55e', strokeWidth: 2 },
        animated: true,
      }),
    );
  }, [productionLine.edges]);

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  // Reset state when production line changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setHasChanges(false);
  }, [initialNodes, initialEdges]);

  const onNodesChange = useCallback((changes: NodeChange<Node<MachineNodeData>>[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
    // Mark as changed if there are position changes (drag end)
    const hasPositionChange = changes.some(
      (c) => c.type === 'position' && 'dragging' in c && c.dragging === false,
    );
    if (hasPositionChange) {
      setHasChanges(true);
    }
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange<Edge>[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
    // Mark as changed on edge removal
    const hasRemoval = changes.some((c) => c.type === 'remove');
    if (hasRemoval) {
      setHasChanges(true);
    }
  }, []);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!canEdit) return;

      // Prevent self-connections
      if (connection.source === connection.target) return;

      // Check if edge already exists
      const exists = edges.some(
        (e) => e.source === connection.source && e.target === connection.target,
      );
      if (exists) return;

      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: 'smoothstep',
            style: { stroke: '#22c55e', strokeWidth: 2 },
            animated: true,
          },
          eds,
        ),
      );
      setHasChanges(true);
    },
    [canEdit, edges],
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save positions
      const positionsPayload = {
        positions: nodes.map((node) => ({
          machineId: node.id,
          positionX: node.position.x,
          positionY: node.position.y,
        })),
      };

      const positionsResponse = await updateNodePositions(productionLine.id, positionsPayload);
      if (positionsResponse.errors) {
        throw new Error('Failed to save positions');
      }

      // Save edges
      const edgesPayload = {
        edges: edges.map((edge) => ({
          sourceNodeId: edge.source,
          targetNodeId: edge.target,
        })),
      };

      const edgesResponse = await updateEdges(productionLine.id, edgesPayload);
      if (edgesResponse.errors) {
        throw new Error('Failed to save edges');
      }

      toast.success(t('layoutSaved'));
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving layout:', error);
      toast.error(t('errorSavingLayout'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    // Reset to auto-layout
    const machines = productionLine.machines || [];
    const autoPositions = calculateAutoLayout(machines);

    setNodes((nds) =>
      nds.map((node, index) => ({
        ...node,
        position: autoPositions[index] || { x: 0, y: 0 },
      })),
    );
    setEdges([]);
    setHasChanges(true);
  };

  return (
    <div className="w-full h-[450px] lg:h-[550px] border rounded-lg overflow-hidden bg-background">
      <ReactFlow
        nodes={nodes}
        edges={showEdges ? edges : []}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        panOnScroll
        selectionOnDrag={false}
        panOnDrag={[1, 2]}
        selectNodesOnDrag={false}
        deleteKeyCode={canEdit ? ['Backspace', 'Delete'] : null}
        edgesReconnectable={canEdit}
      >
        <Background color="#e5e7eb" gap={20} />
        <BackboneConnector nodes={nodes} />
        <Controls />
        <MiniMap
          nodeColor={() => '#22c55e'}
          maskColor="rgba(0, 0, 0, 0.1)"
          className="!bg-background"
        />

        <Panel position="top-left">
          <Button
            variant={showEdges ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowEdges(!showEdges)}
          >
            <GitBranch className="w-4 h-4 mr-2" />
            {t('showConnectors')}
          </Button>
        </Panel>

        {canEdit && (
          <Panel position="top-right" className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleReset} disabled={isSaving}>
              <RotateCcw className="w-4 h-4 mr-2" />
              {t('resetLayout')}
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving || !hasChanges}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? t('saving') : t('saveLayout')}
            </Button>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}
