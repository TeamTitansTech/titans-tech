'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import { Stage, Layer, Line, Rect, Circle, Arrow, Text as KonvaText } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type Konva from 'konva';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  Save,
  RotateCcw,
  MousePointer,
  Move,
  Pencil,
  Square,
  Circle as CircleIcon,
  ArrowRight,
  Type,
  Eraser,
  Trash2,
  ZoomIn,
  ZoomOut,
  Minus,
  Maximize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Box } from 'lucide-react';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { updateNodePositions, updateCanvasShapes } from '@/data/services/production-lines.api';
import type { ProductionLine, ProductionLineMachine } from '@/data/types/production-lines.types';
import type { LatestReport } from '@/data/types/services.types';
import { getLatestReport } from '@/data/services/services.api';
import {
  calculateStatusFromLatestReport,
  getSectionStatusFromReport,
  statusColors,
  statusLabels,
} from '@/lib/alertStatus';
import { useInternalRouter } from '@/hooks/useInternalRouter';
import { StatusBadge } from './StatusBadge';

// Constants
const CARD_WIDTH = 200;
const HORIZONTAL_SPACING = 60;
const CARDS_PER_ROW = 4;

// Drawing tool types
type DrawingTool =
  | 'select'
  | 'move'
  | 'line'
  | 'rectangle'
  | 'circle'
  | 'arrow'
  | 'text'
  | 'eraser';

// Shape types
interface ShapeBase {
  id: string;
  type: string;
  x: number;
  y: number;
  stroke: string;
  strokeWidth: number;
}

interface LineShape extends ShapeBase {
  type: 'line';
  points: number[];
}

interface RectShape extends ShapeBase {
  type: 'rectangle';
  width: number;
  height: number;
  fill?: string;
}

interface CircleShape extends ShapeBase {
  type: 'circle';
  radius: number;
  fill?: string;
}

interface ArrowShape extends ShapeBase {
  type: 'arrow';
  points: number[];
}

interface TextShape extends ShapeBase {
  type: 'text';
  text: string;
  fontSize: number;
}

type Shape = LineShape | RectShape | CircleShape | ArrowShape | TextShape;

// Machine position type
interface MachinePosition {
  machineId: string;
  x: number;
  y: number;
}

// Section i18n keys
const SECTION_I18N_KEYS: Record<string, string> = {
  BEARING_CLEARANCE: 'bearingClearance',
  BEARING_CLEARANCE_SINGLE_HAMMER: 'bearingClearanceSingleHammer',
  SLIDE_SINGLE_HAMMER: 'slideSingleHammer',
  SLIDE_DOUBLE_HAMMER: 'slideDoubleHammer',
  GIBS: 'gibs',
  LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER: 'lubricationHydraulics',
  CLUTCH: 'clutch',
  CLUTCH_CEVOLANI: 'clutchCevolani',
  COUNTERBALANCE_CYLINDER_AIRBAG: 'counterbalance',
  TRAMMING: 'tramming',
  PISTONS: 'pistons',
};

interface ProductionLineKonvaCanvasProps {
  productionLine: ProductionLine;
  canViewMachineDetails?: boolean;
  canEdit?: boolean;
}

// Calculate auto-layout positions
function calculateAutoLayout(machines: ProductionLineMachine[]): MachinePosition[] {
  return machines.map((pm, index) => {
    const row = Math.floor(index / CARDS_PER_ROW);
    const col = index % CARDS_PER_ROW;

    return {
      machineId: pm.machineId,
      x: col * (CARD_WIDTH + HORIZONTAL_SPACING) + 50,
      y: row * 400 + 100,
    };
  });
}

// Machine Card Component (HTML Overlay)
interface MachineCardOverlayProps {
  machine: ProductionLineMachine['machine'];
  sections: string[];
  position: { x: number; y: number };
  scale: number;
  offset: { x: number; y: number };
  isDragging: boolean;
  isMovable: boolean;
  canViewDetails: boolean;
  onDragStart: () => void;
  onDrag: (dx: number, dy: number) => void;
  onDragEnd: () => void;
  onClick: () => void;
}

function MachineCardOverlay({
  machine,
  sections,
  position,
  scale,
  offset,
  isDragging,
  isMovable,
  canViewDetails,
  onDragStart,
  onDrag,
  onDragEnd,
  onClick,
}: MachineCardOverlayProps) {
  const t = useTranslations('machines');
  const [latestReport, setLatestReport] = useState<LatestReport | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!machine) return;
    const fetchReport = async () => {
      try {
        const response = await getLatestReport(machine.id);
        if (response.data) {
          setLatestReport(response.data);
        }
      } catch (error) {
        console.error('Error fetching latest report:', error);
      }
    };
    fetchReport();
  }, [machine?.id]);

  if (!machine) return null;

  const alertStatus = calculateStatusFromLatestReport(latestReport);

  // Calculate screen position
  const screenX = position.x * scale + offset.x;
  const screenY = position.y * scale + offset.y;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isMovable) return;
    e.preventDefault();
    e.stopPropagation();
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    onDragStart();

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragStartRef.current) return;
      const dx = (moveEvent.clientX - dragStartRef.current.x) / scale;
      const dy = (moveEvent.clientY - dragStartRef.current.y) / scale;
      dragStartRef.current = { x: moveEvent.clientX, y: moveEvent.clientY };
      onDrag(dx, dy);
    };

    const handleMouseUp = () => {
      dragStartRef.current = null;
      onDragEnd();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleClick = () => {
    if (isDragging) return;
    if (canViewDetails && !isMovable) {
      onClick();
    }
  };

  return (
    <div
      className="absolute pointer-events-auto"
      style={{
        left: screenX,
        top: screenY,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        cursor: isMovable ? 'move' : canViewDetails ? 'pointer' : 'default',
        zIndex: isDragging ? 1000 : 1,
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      <Card
        className={`w-[200px] shrink-0 transition-shadow ${
          canViewDetails && !isMovable ? 'hover:border-primary/50 hover:shadow-lg' : ''
        } ${isMovable ? 'hover:ring-2 hover:ring-blue-500' : ''}`}
      >
        <CardContent className="p-0">
          <div className="relative aspect-square bg-muted flex items-center justify-center">
            {/* Status Indicator Circle */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`absolute top-2 right-2 w-4 h-4 rounded-full border-2 ${statusColors[alertStatus]} z-10`}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{statusLabels[alertStatus]}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {machine.imageUrl ? (
              <Image
                src={machine.imageUrl}
                alt={machine.name}
                fill
                className="object-cover"
                sizes="200px"
                draggable={false}
              />
            ) : (
              <div className="text-center p-3">
                <Box className="w-12 h-12 mx-auto text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="p-2 border-t">
            <h3 className="text-xs font-semibold text-center line-clamp-2">{machine.name}</h3>
          </div>

          {/* Status badges */}
          {sections.length > 0 && (
            <div className="px-2 pb-2 space-y-1 border-t pt-2">
              {sections.map((section) => {
                const status = getSectionStatusFromReport(section, latestReport);
                const sectionName = t(`sectionNames.${SECTION_I18N_KEYS[section] || 'unknown'}`);
                return <StatusBadge key={section} status={status} label={sectionName} />;
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function ProductionLineKonvaCanvas({
  productionLine,
  canViewMachineDetails = true,
  canEdit = false,
}: ProductionLineKonvaCanvasProps) {
  const t = useTranslations('productionLines');
  const router = useInternalRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);

  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTool, setActiveTool] = useState<DrawingTool>('select');

  // Drawing state
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentShape, setCurrentShape] = useState<Shape | null>(null);
  const [strokeColor] = useState('#22c55e');
  const [strokeWidth] = useState(3);

  // Machine positions state
  const [machinePositions, setMachinePositions] = useState<Map<string, { x: number; y: number }>>(
    new Map(),
  );
  const [draggingMachineId, setDraggingMachineId] = useState<string | null>(null);

  // Stage pan and zoom
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });

  // Text input for text tool
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null);

  // Track if initial fit has been done
  const hasInitialFit = useRef(false);

  // Track Shift key for straight line snapping
  const [isShiftPressed, setIsShiftPressed] = useState(false);

  // Initialize machine positions and canvas shapes
  useEffect(() => {
    const machines = productionLine.machines || [];
    const autoPositions = calculateAutoLayout(machines);
    const positionMap = new Map<string, { x: number; y: number }>();

    machines.forEach((pm, index) => {
      const hasPosition = pm.positionX != null && pm.positionY != null;
      if (hasPosition) {
        positionMap.set(pm.machineId, { x: pm.positionX!, y: pm.positionY! });
      } else {
        positionMap.set(pm.machineId, { x: autoPositions[index].x, y: autoPositions[index].y });
      }
    });

    setMachinePositions(positionMap);

    // Load saved canvas shapes
    if (productionLine.canvasShapes && Array.isArray(productionLine.canvasShapes)) {
      setShapes(productionLine.canvasShapes as Shape[]);
    }
  }, [productionLine.machines, productionLine.canvasShapes]);

  // Handle window resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Track Shift key for straight line drawing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftPressed(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftPressed(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Auto-fit content when canvas loads (only on initial load)
  useEffect(() => {
    if (hasInitialFit.current) return;
    if (stageSize.width === 0 || stageSize.height === 0) return;
    if (machinePositions.size === 0 && shapes.length === 0) return;

    // Calculate bounding box of all content
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    // Include machine positions (with card dimensions)
    machinePositions.forEach((pos) => {
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x + CARD_WIDTH);
      maxY = Math.max(maxY, pos.y + 350); // Approximate card height with sections
    });

    // Include shapes
    shapes.forEach((shape) => {
      switch (shape.type) {
        case 'line':
        case 'arrow':
          if (shape.points) {
            for (let i = 0; i < shape.points.length; i += 2) {
              minX = Math.min(minX, shape.points[i]);
              maxX = Math.max(maxX, shape.points[i]);
              if (shape.points[i + 1] !== undefined) {
                minY = Math.min(minY, shape.points[i + 1]);
                maxY = Math.max(maxY, shape.points[i + 1]);
              }
            }
          }
          break;
        case 'rectangle':
          minX = Math.min(minX, shape.x, shape.x + (shape.width || 0));
          maxX = Math.max(maxX, shape.x, shape.x + (shape.width || 0));
          minY = Math.min(minY, shape.y, shape.y + (shape.height || 0));
          maxY = Math.max(maxY, shape.y, shape.y + (shape.height || 0));
          break;
        case 'circle':
          const radius = shape.radius || 0;
          minX = Math.min(minX, shape.x - radius);
          maxX = Math.max(maxX, shape.x + radius);
          minY = Math.min(minY, shape.y - radius);
          maxY = Math.max(maxY, shape.y + radius);
          break;
        case 'text':
          minX = Math.min(minX, shape.x);
          maxX = Math.max(maxX, shape.x + 100); // Approximate text width
          minY = Math.min(minY, shape.y);
          maxY = Math.max(maxY, shape.y + 20); // Approximate text height
          break;
      }
    });

    // If we have valid bounds, fit the content
    if (minX !== Infinity && maxX !== -Infinity) {
      const contentWidth = maxX - minX;
      const contentHeight = maxY - minY;
      const padding = 50; // Padding around content

      // Calculate scale to fit content
      const scaleX = (stageSize.width - padding * 2) / contentWidth;
      const scaleY = (stageSize.height - padding * 2) / contentHeight;
      const newScale = Math.min(scaleX, scaleY, 1); // Don't zoom in more than 100%

      // Calculate position to center content
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const newX = stageSize.width / 2 - centerX * newScale;
      const newY = stageSize.height / 2 - centerY * newScale;

      setStageScale(newScale);
      setStagePosition({ x: newX, y: newY });
      hasInitialFit.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageSize.width, stageSize.height, machinePositions.size, shapes.length]);

  // Get pointer position relative to stage
  const getRelativePointerPosition = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return null;

    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return null;

    return {
      x: (pointerPos.x - stagePosition.x) / stageScale,
      y: (pointerPos.y - stagePosition.y) / stageScale,
    };
  }, [stageScale, stagePosition]);

  // Snap line endpoint to horizontal, vertical, or 45-degree angles when Shift is held
  const snapToAngle = useCallback(
    (startX: number, startY: number, endX: number, endY: number) => {
      if (!isShiftPressed) return { x: endX, y: endY };

      const dx = endX - startX;
      const dy = endY - startY;
      const angle = Math.atan2(dy, dx);
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Snap to nearest 45-degree angle (0, 45, 90, 135, 180, etc.)
      const snapAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);

      return {
        x: startX + Math.cos(snapAngle) * distance,
        y: startY + Math.sin(snapAngle) * distance,
      };
    },
    [isShiftPressed],
  );

  // Handle mouse down for drawing
  const handleMouseDown = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (!canEdit) return;

      // Check if we clicked on the stage background
      const clickedOnEmpty = e.target === e.target.getStage();

      // Handle select tool - just allow panning
      if (activeTool === 'select') {
        return;
      }

      // Handle eraser tool
      if (activeTool === 'eraser') {
        const clickedId = e.target.id();
        if (clickedId && clickedId !== '') {
          setShapes((prev) => prev.filter((s) => s.id !== clickedId));
          setHasChanges(true);
        }
        return;
      }

      // Handle text tool
      if (activeTool === 'text') {
        const pos = getRelativePointerPosition();
        if (pos) {
          setTextPosition(pos);
        }
        return;
      }

      // Handle move tool - don't draw
      if (activeTool === 'move') return;

      // Start drawing shapes
      if (!clickedOnEmpty) return;

      const pos = getRelativePointerPosition();
      if (!pos) return;

      setIsDrawing(true);

      const id = `shape-${Date.now()}`;

      switch (activeTool) {
        case 'line':
          setCurrentShape({
            id,
            type: 'line',
            x: 0,
            y: 0,
            points: [pos.x, pos.y, pos.x, pos.y],
            stroke: strokeColor,
            strokeWidth,
          });
          break;
        case 'rectangle':
          setCurrentShape({
            id,
            type: 'rectangle',
            x: pos.x,
            y: pos.y,
            width: 0,
            height: 0,
            stroke: strokeColor,
            strokeWidth,
          });
          break;
        case 'circle':
          setCurrentShape({
            id,
            type: 'circle',
            x: pos.x,
            y: pos.y,
            radius: 0,
            stroke: strokeColor,
            strokeWidth,
          });
          break;
        case 'arrow':
          setCurrentShape({
            id,
            type: 'arrow',
            x: 0,
            y: 0,
            points: [pos.x, pos.y, pos.x, pos.y],
            stroke: strokeColor,
            strokeWidth,
          });
          break;
      }
    },
    [activeTool, canEdit, getRelativePointerPosition, strokeColor, strokeWidth],
  );

  // Handle mouse move for drawing
  const handleMouseMove = useCallback(() => {
    if (!isDrawing || !currentShape) return;

    const pos = getRelativePointerPosition();
    if (!pos) return;

    switch (currentShape.type) {
      case 'line': {
        const snapped = snapToAngle(currentShape.points[0], currentShape.points[1], pos.x, pos.y);
        setCurrentShape({
          ...currentShape,
          points: [currentShape.points[0], currentShape.points[1], snapped.x, snapped.y],
        });
        break;
      }
      case 'rectangle':
        setCurrentShape({
          ...currentShape,
          width: pos.x - currentShape.x,
          height: pos.y - currentShape.y,
        });
        break;
      case 'circle': {
        const dx = pos.x - currentShape.x;
        const dy = pos.y - currentShape.y;
        setCurrentShape({
          ...currentShape,
          radius: Math.sqrt(dx * dx + dy * dy),
        });
        break;
      }
      case 'arrow': {
        const snapped = snapToAngle(currentShape.points[0], currentShape.points[1], pos.x, pos.y);
        setCurrentShape({
          ...currentShape,
          points: [currentShape.points[0], currentShape.points[1], snapped.x, snapped.y],
        });
        break;
      }
    }
  }, [isDrawing, currentShape, getRelativePointerPosition, snapToAngle]);

  // Handle mouse up to finish drawing
  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !currentShape) return;

    setIsDrawing(false);

    // Validate shape has minimum size
    let isValid = false;
    switch (currentShape.type) {
      case 'line':
      case 'arrow':
        const dx = currentShape.points[2] - currentShape.points[0];
        const dy = currentShape.points[3] - currentShape.points[1];
        isValid = Math.sqrt(dx * dx + dy * dy) > 10;
        break;
      case 'rectangle':
        isValid = Math.abs(currentShape.width) > 10 && Math.abs(currentShape.height) > 10;
        break;
      case 'circle':
        isValid = currentShape.radius > 10;
        break;
    }

    if (isValid) {
      setShapes((prev) => [...prev, currentShape]);
      setHasChanges(true);
    }

    setCurrentShape(null);
  }, [isDrawing, currentShape]);

  // Handle wheel for zoom
  const handleWheel = useCallback((e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const scaleBy = 1.1;
    let newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    // Limit zoom
    newScale = Math.max(0.1, Math.min(3, newScale));

    setStageScale(newScale);
    setStagePosition({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  }, []);

  // Handle machine position change
  const handleMachinePositionChange = useCallback(
    (machineId: string, dx: number, dy: number) => {
      if (!canEdit) return;

      setMachinePositions((prev) => {
        const newMap = new Map(prev);
        const current = newMap.get(machineId);
        if (current) {
          newMap.set(machineId, { x: current.x + dx, y: current.y + dy });
        }
        return newMap;
      });
      setHasChanges(true);
    },
    [canEdit],
  );

  // Handle machine click to navigate
  const handleMachineClick = useCallback(
    (machineId: string) => {
      if (canViewMachineDetails) {
        router.push(`/machines/${machineId}`);
      }
    },
    [canViewMachineDetails, router],
  );

  // Handle text submit
  const handleTextSubmit = useCallback(() => {
    if (!textPosition || !textInput.trim()) {
      setTextPosition(null);
      setTextInput('');
      return;
    }

    const newText: TextShape = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: textPosition.x,
      y: textPosition.y,
      text: textInput,
      fontSize: 16,
      stroke: strokeColor,
      strokeWidth: 1,
    };

    setShapes((prev) => [...prev, newText]);
    setHasChanges(true);
    setTextPosition(null);
    setTextInput('');
  }, [textPosition, textInput, strokeColor]);

  // Remove last shape
  const handleRemoveLastShape = useCallback(() => {
    if (shapes.length === 0) return;
    setShapes((prev) => prev.slice(0, -1));
    setHasChanges(true);
  }, [shapes.length]);

  // Clear all shapes
  const handleClearAllShapes = useCallback(() => {
    setShapes([]);
    setHasChanges(true);
  }, []);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setStageScale((prev) => Math.min(3, prev * 1.2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setStageScale((prev) => Math.max(0.1, prev / 1.2));
  }, []);

  // Fit to view - center and scale to show all content
  const handleFitToView = useCallback(() => {
    if (machinePositions.size === 0 && shapes.length === 0) return;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    machinePositions.forEach((pos) => {
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x + CARD_WIDTH);
      maxY = Math.max(maxY, pos.y + 350);
    });

    shapes.forEach((shape) => {
      switch (shape.type) {
        case 'line':
        case 'arrow':
          if (shape.points) {
            for (let i = 0; i < shape.points.length; i += 2) {
              minX = Math.min(minX, shape.points[i]);
              maxX = Math.max(maxX, shape.points[i]);
              if (shape.points[i + 1] !== undefined) {
                minY = Math.min(minY, shape.points[i + 1]);
                maxY = Math.max(maxY, shape.points[i + 1]);
              }
            }
          }
          break;
        case 'rectangle':
          minX = Math.min(minX, shape.x, shape.x + (shape.width || 0));
          maxX = Math.max(maxX, shape.x, shape.x + (shape.width || 0));
          minY = Math.min(minY, shape.y, shape.y + (shape.height || 0));
          maxY = Math.max(maxY, shape.y, shape.y + (shape.height || 0));
          break;
        case 'circle':
          const radius = shape.radius || 0;
          minX = Math.min(minX, shape.x - radius);
          maxX = Math.max(maxX, shape.x + radius);
          minY = Math.min(minY, shape.y - radius);
          maxY = Math.max(maxY, shape.y + radius);
          break;
        case 'text':
          minX = Math.min(minX, shape.x);
          maxX = Math.max(maxX, shape.x + 100);
          minY = Math.min(minY, shape.y);
          maxY = Math.max(maxY, shape.y + 20);
          break;
      }
    });

    if (minX !== Infinity && maxX !== -Infinity) {
      const contentWidth = maxX - minX;
      const contentHeight = maxY - minY;
      const padding = 50;

      const scaleX = (stageSize.width - padding * 2) / contentWidth;
      const scaleY = (stageSize.height - padding * 2) / contentHeight;
      const newScale = Math.min(scaleX, scaleY, 1);

      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const newX = stageSize.width / 2 - centerX * newScale;
      const newY = stageSize.height / 2 - centerY * newScale;

      setStageScale(newScale);
      setStagePosition({ x: newX, y: newY });
    }
  }, [machinePositions, shapes, stageSize.width, stageSize.height]);

  // Reset layout
  const handleReset = useCallback(() => {
    const machines = productionLine.machines || [];
    const autoPositions = calculateAutoLayout(machines);
    const positionMap = new Map<string, { x: number; y: number }>();

    machines.forEach((pm, index) => {
      positionMap.set(pm.machineId, { x: autoPositions[index].x, y: autoPositions[index].y });
    });

    setMachinePositions(positionMap);
    setShapes([]);
    setStageScale(1);
    setStagePosition({ x: 0, y: 0 });
    setHasChanges(true);
  }, [productionLine.machines]);

  // Save layout
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      // Save machine positions
      const positions = Array.from(machinePositions.entries()).map(([machineId, pos]) => ({
        machineId,
        positionX: pos.x,
        positionY: pos.y,
      }));

      const positionsResponse = await updateNodePositions(productionLine.id, { positions });
      if (positionsResponse.errors) {
        throw new Error('Failed to save positions');
      }

      // Save canvas shapes
      const shapesResponse = await updateCanvasShapes(productionLine.id, { shapes });
      if (shapesResponse.errors) {
        throw new Error('Failed to save canvas shapes');
      }

      toast.success(t('layoutSaved'));
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving layout:', error);
      toast.error(t('errorSavingLayout'));
    } finally {
      setIsSaving(false);
    }
  }, [machinePositions, shapes, productionLine.id, t]);

  const machines = productionLine.machines || [];

  // Render shape based on type
  const renderShape = (shape: Shape, isPreview = false) => {
    const opacity = isPreview ? 0.7 : 1;
    const key = isPreview ? `preview-${shape.id}` : shape.id;

    switch (shape.type) {
      case 'line':
        return (
          <Line
            key={key}
            id={shape.id}
            points={shape.points}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
            lineCap="round"
            lineJoin="round"
            opacity={opacity}
            dash={[10, 5]}
          />
        );
      case 'rectangle':
        return (
          <Rect
            key={key}
            id={shape.id}
            x={shape.x}
            y={shape.y}
            width={shape.width}
            height={shape.height}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
            opacity={opacity}
          />
        );
      case 'circle':
        return (
          <Circle
            key={key}
            id={shape.id}
            x={shape.x}
            y={shape.y}
            radius={shape.radius}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
            opacity={opacity}
          />
        );
      case 'arrow':
        return (
          <Arrow
            key={key}
            id={shape.id}
            points={shape.points}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
            fill={shape.stroke}
            pointerLength={10}
            pointerWidth={10}
            opacity={opacity}
          />
        );
      case 'text':
        return (
          <KonvaText
            key={key}
            id={shape.id}
            x={shape.x}
            y={shape.y}
            text={shape.text}
            fontSize={shape.fontSize}
            fill={shape.stroke}
            opacity={opacity}
          />
        );
    }
  };

  const toolButtons: { tool: DrawingTool; icon: React.ReactNode; label: string }[] = [
    { tool: 'select', icon: <MousePointer className="w-4 h-4" />, label: t('select') },
    { tool: 'move', icon: <Move className="w-4 h-4" />, label: t('moveMachines') },
    { tool: 'line', icon: <Pencil className="w-4 h-4" />, label: t('drawLine') },
    { tool: 'rectangle', icon: <Square className="w-4 h-4" />, label: t('drawRectangle') },
    { tool: 'circle', icon: <CircleIcon className="w-4 h-4" />, label: t('drawCircle') },
    { tool: 'arrow', icon: <ArrowRight className="w-4 h-4" />, label: t('drawArrow') },
    { tool: 'text', icon: <Type className="w-4 h-4" />, label: t('addText') },
    { tool: 'eraser', icon: <Eraser className="w-4 h-4" />, label: t('eraser') },
  ];

  return (
    <div className="w-full h-[600px] lg:h-[700px] border rounded-lg overflow-hidden bg-gray-50 relative">
      {/* Drawing Toolbar - only show in edit mode */}
      {canEdit && (
        <div className="absolute top-4 left-4 z-20 flex gap-1 flex-wrap bg-white/95 backdrop-blur-sm rounded-lg p-2 shadow-md border">
          {toolButtons.map(({ tool, icon, label }) => (
            <TooltipProvider key={tool}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTool === tool ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTool(tool)}
                    className="px-2"
                  >
                    {icon}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{label}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}

          {/* Separator */}
          <div className="w-px h-8 bg-border mx-1" />

          {/* Undo/Clear */}
          {shapes.length > 0 && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveLastShape}
                      className="px-2 text-destructive hover:text-destructive"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('removeLastBackbone')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearAllShapes}
                      className="px-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('removeAllBackbones')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>
      )}

      {/* Zoom Controls - only visible for editors */}
      {canEdit && (
        <div className="absolute bottom-4 left-4 z-20 flex gap-1 bg-white/95 backdrop-blur-sm rounded-lg p-1 shadow-md border">
          <Button variant="ghost" size="sm" onClick={handleZoomOut} className="px-2">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="px-2 py-1 text-sm font-medium min-w-[60px] text-center">
            {Math.round(stageScale * 100)}%
          </span>
          <Button variant="ghost" size="sm" onClick={handleZoomIn} className="px-2">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1 self-center" />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleFitToView} className="px-2">
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('fitToView')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* Save/Reset buttons */}
      {canEdit && (
        <div className="absolute top-4 right-4 z-20 flex gap-2 bg-white/95 backdrop-blur-sm rounded-lg p-2 shadow-md border">
          <Button variant="outline" size="sm" onClick={handleReset} disabled={isSaving}>
            <RotateCcw className="w-4 h-4 mr-2" />
            {t('resetLayout')}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving || !hasChanges}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? t('saving') : t('saveLayout')}
          </Button>
        </div>
      )}

      {/* Tool instruction */}
      {canEdit && activeTool !== 'select' && activeTool !== 'move' && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 bg-green-500/20 border-2 border-dashed border-green-500 rounded-lg px-4 py-2 text-green-700 font-medium text-sm">
          {activeTool === 'text' ? t('clickToAddText') : t('drawBackboneInstruction')}
        </div>
      )}

      {/* Text input modal */}
      {canEdit && textPosition && (
        <div
          className="absolute z-30 bg-white rounded-lg shadow-lg p-3 border"
          style={{
            left: textPosition.x * stageScale + stagePosition.x,
            top: textPosition.y * stageScale + stagePosition.y,
          }}
        >
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTextSubmit();
              if (e.key === 'Escape') {
                setTextPosition(null);
                setTextInput('');
              }
            }}
            placeholder={t('enterText')}
            className="border rounded px-2 py-1 text-sm w-48"
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={handleTextSubmit}>
              {t('add')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setTextPosition(null);
                setTextInput('');
              }}
            >
              {t('cancelDrawing')}
            </Button>
          </div>
        </div>
      )}

      {/* Canvas Container */}
      <div ref={containerRef} className="w-full h-full relative">
        {/* Konva Stage for Drawing */}
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          scaleX={stageScale}
          scaleY={stageScale}
          x={stagePosition.x}
          y={stagePosition.y}
          onMouseDown={canEdit ? handleMouseDown : undefined}
          onMousemove={canEdit ? handleMouseMove : undefined}
          onMouseup={canEdit ? handleMouseUp : undefined}
          onMouseLeave={canEdit ? handleMouseUp : undefined}
          onWheel={canEdit ? handleWheel : undefined}
          draggable={canEdit && activeTool === 'select'}
          onDragEnd={(e) => {
            if (e.target === stageRef.current) {
              setStagePosition({ x: e.target.x(), y: e.target.y() });
            }
          }}
          style={{
            cursor: !canEdit
              ? 'default'
              : activeTool === 'select'
                ? 'grab'
                : activeTool === 'move'
                  ? 'default'
                  : activeTool === 'eraser'
                    ? 'crosshair'
                    : 'crosshair',
          }}
        >
          {/* Grid Layer */}
          <Layer>
            {Array.from({ length: Math.ceil(3000 / 40) }).map((_, i) => (
              <Line
                key={`grid-v-${i}`}
                points={[i * 40, -500, i * 40, 2500]}
                stroke="#e5e7eb"
                strokeWidth={1}
              />
            ))}
            {Array.from({ length: Math.ceil(3000 / 40) }).map((_, i) => (
              <Line
                key={`grid-h-${i}`}
                points={[-500, i * 40, 3000, i * 40]}
                stroke="#e5e7eb"
                strokeWidth={1}
              />
            ))}
          </Layer>

          {/* Shapes Layer */}
          <Layer>
            {shapes.map((shape) => renderShape(shape))}
            {currentShape && renderShape(currentShape, true)}
          </Layer>
        </Stage>

        {/* Machine Cards Overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {machines.map((pm) => {
            const position = machinePositions.get(pm.machineId);
            if (!position || !pm.machine) return null;

            return (
              <MachineCardOverlay
                key={pm.machineId}
                machine={pm.machine}
                sections={pm.machine.blueprint?.sections || []}
                position={position}
                scale={stageScale}
                offset={stagePosition}
                isDragging={draggingMachineId === pm.machineId}
                isMovable={canEdit && activeTool === 'move'}
                canViewDetails={canViewMachineDetails}
                onDragStart={() => setDraggingMachineId(pm.machineId)}
                onDrag={(dx, dy) => handleMachinePositionChange(pm.machineId, dx, dy)}
                onDragEnd={() => setDraggingMachineId(null)}
                onClick={() => handleMachineClick(pm.machineId)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
