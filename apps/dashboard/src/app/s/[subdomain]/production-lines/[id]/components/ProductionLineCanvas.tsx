'use client';

import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
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
import { Save, RotateCcw, GitBranch, Link, Plus, Trash2, Minus } from 'lucide-react';
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

// Backbone configuration type - supports any angle
interface BackboneConfig {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

// Helper function to find closest point on a line segment to a given point
function closestPointOnLine(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): { x: number; y: number } {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    return { x: x1, y: y1 };
  }

  // Calculate projection of point onto line
  let t = ((px - x1) * dx + (py - y1) * dy) / lengthSquared;
  t = Math.max(0, Math.min(1, t)); // Clamp to line segment

  return {
    x: x1 + t * dx,
    y: y1 + t * dy,
  };
}

// Backbone connector component - draws lines with optional connectors to nodes
interface BackboneConnectorProps {
  nodes: Node<MachineNodeData>[];
  connectedNodes: Map<string, string>; // nodeId -> backboneId
  backbones: BackboneConfig[];
}

function BackboneConnector({ nodes, connectedNodes, backbones }: BackboneConnectorProps) {
  const viewport = useViewport();

  if (backbones.length === 0) return null;

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
        {/* Draw all backbone lines */}
        {backbones.map((backbone) => (
          <line
            key={backbone.id}
            x1={backbone.startX}
            y1={backbone.startY}
            x2={backbone.endX}
            y2={backbone.endY}
            stroke="#22c55e"
            strokeWidth={3}
            strokeDasharray="8 4"
          />
        ))}

        {/* Draw connectors from nodes to their assigned backbone */}
        {nodes
          .filter((node) => connectedNodes.has(node.id))
          .map((node) => {
            const backboneId = connectedNodes.get(node.id);
            const backbone = backbones.find((b) => b.id === backboneId);
            if (!backbone) return null;

            // Calculate node center
            const nodeCenterX = node.position.x + NODE_WIDTH / 2;
            const nodeCenterY = node.position.y + NODE_HEIGHT / 2;

            // Find closest point on backbone to node center
            const closestPoint = closestPointOnLine(
              nodeCenterX,
              nodeCenterY,
              backbone.startX,
              backbone.startY,
              backbone.endX,
              backbone.endY,
            );

            // Determine connection point on node (top, bottom, left, or right edge)
            const nodeTop = node.position.y;
            const nodeBottom = node.position.y + NODE_HEIGHT;
            const nodeLeft = node.position.x;
            const nodeRight = node.position.x + NODE_WIDTH;

            // Find which edge is closest to the backbone point
            let connectX = nodeCenterX;
            let connectY = nodeCenterY;

            const distToTop = Math.abs(closestPoint.y - nodeTop);
            const distToBottom = Math.abs(closestPoint.y - nodeBottom);
            const distToLeft = Math.abs(closestPoint.x - nodeLeft);
            const distToRight = Math.abs(closestPoint.x - nodeRight);

            const minDist = Math.min(distToTop, distToBottom, distToLeft, distToRight);

            if (minDist === distToTop) {
              connectY = nodeTop;
            } else if (minDist === distToBottom) {
              connectY = nodeBottom;
            } else if (minDist === distToLeft) {
              connectX = nodeLeft;
            } else {
              connectX = nodeRight;
            }

            return (
              <line
                key={`connector-${node.id}`}
                x1={connectX}
                y1={connectY}
                x2={closestPoint.x}
                y2={closestPoint.y}
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

// Component to show drawing preview when drawing backbone
interface BackboneDrawingPreviewProps {
  drawStart: { x: number; y: number } | null;
  drawEnd: { x: number; y: number } | null;
  isDrawing: boolean;
  message: string;
}

function BackboneDrawingPreview({
  drawStart,
  drawEnd,
  isDrawing,
  message,
}: BackboneDrawingPreviewProps) {
  const viewport = useViewport();
  const transform = `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`;

  return (
    <>
      {/* Instruction message */}
      <div
        className="absolute inset-0 pointer-events-none flex items-start justify-center pt-20"
        style={{ zIndex: 1000 }}
      >
        <div className="bg-green-500/20 border-2 border-dashed border-green-500 rounded-lg px-4 py-2 text-green-700 font-medium">
          {message}
        </div>
      </div>

      {/* Drawing preview line - supports any angle */}
      {isDrawing && drawStart && drawEnd && (
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            overflow: 'visible',
            zIndex: 999,
          }}
        >
          <g style={{ transform, transformOrigin: '0 0' }}>
            <line
              x1={drawStart.x}
              y1={drawStart.y}
              x2={drawEnd.x}
              y2={drawEnd.y}
              stroke="#22c55e"
              strokeWidth={3}
              strokeDasharray="8 4"
              opacity={0.7}
            />
          </g>
        </svg>
      )}
    </>
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
  const [connectedNodes, setConnectedNodes] = useState<Map<string, string>>(new Map()); // nodeId -> backboneId
  const [connectMode, setConnectMode] = useState(false);
  const [selectedBackboneId, setSelectedBackboneId] = useState<string | null>(null);
  const [backbones, setBackbones] = useState<BackboneConfig[]>([]);
  const [drawingMode, setDrawingMode] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawEnd, setDrawEnd] = useState<{ x: number; y: number } | null>(null);
  const reactFlowRef = useRef<HTMLDivElement>(null);

  // Find the nearest backbone to a node
  const findNearestBackbone = useCallback(
    (nodeX: number, nodeY: number): BackboneConfig | null => {
      if (backbones.length === 0) return null;
      if (backbones.length === 1) return backbones[0];

      let nearest: BackboneConfig | null = null;
      let minDistance = Infinity;

      const nodeCenterX = nodeX + NODE_WIDTH / 2;
      const nodeCenterY = nodeY + NODE_HEIGHT / 2;

      for (const backbone of backbones) {
        const closestPoint = closestPointOnLine(
          nodeCenterX,
          nodeCenterY,
          backbone.startX,
          backbone.startY,
          backbone.endX,
          backbone.endY,
        );
        const distance = Math.sqrt(
          Math.pow(closestPoint.x - nodeCenterX, 2) + Math.pow(closestPoint.y - nodeCenterY, 2),
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearest = backbone;
        }
      }

      return nearest;
    },
    [backbones],
  );

  // Callback to toggle backbone connection for a node
  const handleToggleBackboneConnection = useCallback(
    (machineId: string, nodeX: number, nodeY: number) => {
      if (backbones.length === 0) {
        toast.error(t('addBackboneFirst'));
        return;
      }

      setConnectedNodes((prev) => {
        const newMap = new Map(prev);
        if (newMap.has(machineId)) {
          newMap.delete(machineId);
        } else {
          // Connect to the selected backbone or the nearest one
          const targetBackbone = selectedBackboneId
            ? backbones.find((b) => b.id === selectedBackboneId)
            : findNearestBackbone(nodeX, nodeY);
          if (targetBackbone) {
            newMap.set(machineId, targetBackbone.id);
          }
        }
        return newMap;
      });
      setHasChanges(true);
    },
    [backbones, selectedBackboneId, findNearestBackbone, t],
  );

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
          connectMode: false,
          isConnectedToBackbone: false,
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

  // Update node data when connectMode, connectedNodes, or backbones changes
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          connectMode: connectMode && backbones.length > 0,
          isConnectedToBackbone: connectedNodes.has(node.id),
          onToggleBackboneConnection: handleToggleBackboneConnection,
        },
      })),
    );
  }, [connectMode, connectedNodes, handleToggleBackboneConnection, backbones]);

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

  // Convert screen coordinates to flow coordinates
  const screenToFlowCoordinates = useCallback((clientX: number, clientY: number) => {
    const reactFlowBounds = reactFlowRef.current?.getBoundingClientRect();
    if (!reactFlowBounds) return null;

    // Get the pane element to access the transform
    const pane = reactFlowRef.current?.querySelector('.react-flow__viewport') as HTMLElement;
    if (!pane) return null;

    const transform = pane.style.transform;
    const match = transform.match(/translate\((-?[\d.]+)px,\s*(-?[\d.]+)px\)\s*scale\(([\d.]+)\)/);

    if (!match) return null;

    const translateX = parseFloat(match[1]);
    const translateY = parseFloat(match[2]);
    const scale = parseFloat(match[3]);

    const x = (clientX - reactFlowBounds.left - translateX) / scale;
    const y = (clientY - reactFlowBounds.top - translateY) / scale;

    return { x, y };
  }, []);

  // Handle mouse down for backbone drawing
  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (!drawingMode || !canEdit) return;

      const coords = screenToFlowCoordinates(event.clientX, event.clientY);
      if (!coords) return;

      setIsDrawing(true);
      setDrawStart(coords);
      setDrawEnd(coords);
    },
    [drawingMode, canEdit, screenToFlowCoordinates],
  );

  // Handle mouse move for backbone drawing
  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (!isDrawing || !drawStart) return;

      const coords = screenToFlowCoordinates(event.clientX, event.clientY);
      if (!coords) return;

      setDrawEnd(coords);
    },
    [isDrawing, drawStart, screenToFlowCoordinates],
  );

  // Handle mouse up to finish backbone drawing
  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !drawStart || !drawEnd) return;

    // Calculate line length (Euclidean distance for any angle)
    const minLength = 50;
    const dx = drawEnd.x - drawStart.x;
    const dy = drawEnd.y - drawStart.y;
    const lineLength = Math.sqrt(dx * dx + dy * dy);

    if (lineLength < minLength) {
      toast.error(t('backboneTooShort'));
      setIsDrawing(false);
      setDrawStart(null);
      setDrawEnd(null);
      return;
    }

    // Create the backbone with fixed coordinates (any angle)
    const newBackbone: BackboneConfig = {
      id: `backbone-${Date.now()}`,
      startX: drawStart.x,
      startY: drawStart.y,
      endX: drawEnd.x,
      endY: drawEnd.y,
    };

    setBackbones((prev) => [...prev, newBackbone]);
    setDrawingMode(false);
    setIsDrawing(false);
    setDrawStart(null);
    setDrawEnd(null);
    setHasChanges(true);
    toast.success(t('backboneAdded'));
  }, [isDrawing, drawStart, drawEnd, t]);

  const handleAddBackbone = () => {
    setDrawingMode(true);
  };

  const handleCancelDrawing = () => {
    setDrawingMode(false);
    setIsDrawing(false);
    setDrawStart(null);
    setDrawEnd(null);
  };

  const handleRemoveAllBackbones = () => {
    setBackbones([]);
    setConnectedNodes(new Map());
    setConnectMode(false);
    setSelectedBackboneId(null);
    setHasChanges(true);
    toast.success(t('allBackbonesRemoved'));
  };

  const handleRemoveLastBackbone = () => {
    if (backbones.length === 0) return;

    const lastBackbone = backbones[backbones.length - 1];
    setBackbones((prev) => prev.slice(0, -1));

    // Remove connections to the deleted backbone
    setConnectedNodes((prev) => {
      const newMap = new Map(prev);
      for (const [nodeId, backboneId] of newMap) {
        if (backboneId === lastBackbone.id) {
          newMap.delete(nodeId);
        }
      }
      return newMap;
    });

    setHasChanges(true);
    toast.success(t('backboneRemoved'));
  };

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
    setBackbones([]);
    setConnectedNodes(new Map());
    setConnectMode(false);
    setSelectedBackboneId(null);
    setDrawingMode(false);
    setHasChanges(true);
  };

  return (
    <div
      ref={reactFlowRef}
      className="w-full h-[600px] lg:h-[700px] border rounded-lg overflow-hidden bg-background"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
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
        panOnDrag={drawingMode ? false : [1, 2]}
        selectNodesOnDrag={false}
        deleteKeyCode={canEdit ? ['Backspace', 'Delete'] : null}
        edgesReconnectable={canEdit}
        className={drawingMode ? 'cursor-crosshair' : connectMode ? 'cursor-pointer' : ''}
      >
        <Background color="#e5e7eb" gap={20} />
        <BackboneConnector nodes={nodes} connectedNodes={connectedNodes} backbones={backbones} />
        {drawingMode && (
          <BackboneDrawingPreview
            drawStart={drawStart}
            drawEnd={drawEnd}
            isDrawing={isDrawing}
            message={t('drawBackboneInstruction')}
          />
        )}
        <Controls />
        <MiniMap
          nodeColor={() => '#22c55e'}
          maskColor="rgba(0, 0, 0, 0.1)"
          className="!bg-background"
        />

        <Panel position="top-left" className="flex gap-2 flex-wrap">
          <Button
            variant={showEdges ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowEdges(!showEdges)}
            disabled={drawingMode}
          >
            <GitBranch className="w-4 h-4 mr-2" />
            {t('showConnectors')}
          </Button>
          {canEdit && (
            <>
              {drawingMode ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelDrawing}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('cancelDrawing')}
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={handleAddBackbone}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('addBackbone')}
                    {backbones.length > 0 && (
                      <span className="ml-1 text-xs bg-green-500 text-white rounded-full px-1.5">
                        {backbones.length}
                      </span>
                    )}
                  </Button>
                  {backbones.length > 0 && (
                    <>
                      <Button
                        variant={connectMode ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setConnectMode(!connectMode)}
                      >
                        <Link className="w-4 h-4 mr-2" />
                        {t('connectToLine')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveLastBackbone}
                        className="text-destructive hover:text-destructive"
                      >
                        <Minus className="w-4 h-4 mr-2" />
                        {t('removeLastBackbone')}
                      </Button>
                      {backbones.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRemoveAllBackbones}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {t('removeAllBackbones')}
                        </Button>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
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
