'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Factory, MoveDown, MoveUp, GripVertical, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MachineCardInLine } from './MachineCardInLine';
import { updateProductionLine } from '@/data/services/production-lines.api';
import { toast } from 'sonner';
import type { ProductionLine, ProductionLineMachine } from '@/data/types/production-lines.types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ViewTabProps {
  productionLine: ProductionLine;
  canViewMachineDetails?: boolean;
  canEdit?: boolean;
  onOrderChange?: (updatedLine: ProductionLine) => void;
}

interface SortableMachineCardProps {
  productionLineMachine: ProductionLineMachine;
  canViewDetails: boolean;
  canEdit: boolean;
  showArrow: 'up' | 'down' | null;
}

function SortableMachineCard({
  productionLineMachine,
  canViewDetails,
  canEdit,
  showArrow,
}: SortableMachineCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: productionLineMachine.machineId,
    disabled: !canEdit,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative flex flex-col items-center">
      {canEdit && (
        <div
          {...attributes}
          {...listeners}
          className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 bg-primary text-primary-foreground rounded-full p-1 cursor-grab active:cursor-grabbing shadow-md hover:bg-primary/90 transition-colors"
        >
          <GripVertical className="w-4 h-4" />
        </div>
      )}
      <MachineCardInLine machine={productionLineMachine.machine!} canViewDetails={canViewDetails} />
      {showArrow === 'up' && (
        <div className="flex flex-col items-center mt-5">
          <MoveUp className="w-6 h-6 text-green-500 -mb-1" />
        </div>
      )}
      {showArrow === 'down' && (
        <div className="flex flex-col items-center mb-5">
          <MoveDown className="w-6 h-6 text-green-500 -mb-1" />
        </div>
      )}
    </div>
  );
}

export function ViewTab({
  productionLine,
  canViewMachineDetails = true,
  canEdit = false,
  onOrderChange,
}: ViewTabProps) {
  const t = useTranslations('productionLines');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Initialize machine order from production line
  const initialOrder =
    productionLine.machines?.sort((a, b) => a.order - b.order).map((pm) => pm.machineId) || [];
  const [machineOrder, setMachineOrder] = useState<string[]>(initialOrder);

  // Reset order when production line changes
  useEffect(() => {
    const newOrder =
      productionLine.machines?.sort((a, b) => a.order - b.order).map((pm) => pm.machineId) || [];
    setMachineOrder(newOrder);
    setHasChanges(false);
  }, [productionLine]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Get ordered machines based on current order
  const orderedMachines = machineOrder
    .map((id) => productionLine.machines?.find((pm) => pm.machineId === id))
    .filter((pm): pm is ProductionLineMachine => pm !== undefined && pm.machine !== undefined);

  const shouldAlternateLayout = orderedMachines.length > 2;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      setMachineOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
      setHasChanges(true);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await updateProductionLine(productionLine.id, {
        machineIds: machineOrder,
      });

      if (response.errors) {
        toast.error(t('errorSaving'));
        return;
      }

      if (response.data) {
        toast.success(t('orderSaved'));
        setHasChanges(false);
        onOrderChange?.(response.data);
      }
    } catch (error) {
      toast.error(t('errorSaving'));
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const activeMachine = activeId
    ? productionLine.machines?.find((pm) => pm.machineId === activeId)
    : null;

  if (orderedMachines.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <Factory className="w-16 h-16 mx-auto text-muted-foreground opacity-50" />
            <div>
              <p className="text-lg font-medium">{t('noMachinesConfigured')}</p>
              <p className="text-sm text-muted-foreground">{t('configureFirst')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative w-full">
      {/* Save button when there are changes */}
      {canEdit && hasChanges && (
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b p-3 mb-4 flex items-center justify-between rounded-lg shadow-sm">
          <p className="text-sm text-muted-foreground">{t('unsavedChanges')}</p>
          <Button onClick={handleSave} disabled={isSaving} size="sm">
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSaving ? t('saving') : t('saveOrder')}
          </Button>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="hidden lg:block overflow-x-auto pb-8">
          <div className="relative min-w-max px-12 pt-8 pb-16">
            {shouldAlternateLayout ? (
              <div className="relative flex flex-col">
                {/* Top row - even indices */}
                <SortableContext items={machineOrder} strategy={horizontalListSortingStrategy}>
                  <div className="flex justify-between items-end gap-8">
                    {orderedMachines.map((productionLineMachine, index) => {
                      if (index % 2 !== 0) return null;
                      return (
                        <SortableMachineCard
                          key={productionLineMachine.machineId}
                          productionLineMachine={productionLineMachine}
                          canViewDetails={canViewMachineDetails}
                          canEdit={canEdit}
                          showArrow="up"
                        />
                      );
                    })}
                  </div>
                </SortableContext>

                <div className="relative h-1 w-full">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-green-500" />
                </div>

                {/* Bottom row - odd indices */}
                <SortableContext items={machineOrder} strategy={horizontalListSortingStrategy}>
                  <div className="flex justify-center items-start gap-8">
                    {orderedMachines.map((productionLineMachine, index) => {
                      if (index % 2 === 0) return null;
                      return (
                        <div
                          key={productionLineMachine.machineId}
                          className="relative flex flex-col items-center"
                        >
                          <div className="flex flex-col items-center mb-5">
                            <MoveDown className="w-6 h-6 text-green-500 -mb-1" />
                          </div>
                          <SortableMachineCard
                            productionLineMachine={productionLineMachine}
                            canViewDetails={canViewMachineDetails}
                            canEdit={canEdit}
                            showArrow={null}
                          />
                        </div>
                      );
                    })}
                  </div>
                </SortableContext>
              </div>
            ) : (
              <div className="relative flex items-center">
                <SortableContext items={machineOrder} strategy={horizontalListSortingStrategy}>
                  <div className="flex items-center gap-8">
                    {orderedMachines.map((productionLineMachine) => (
                      <SortableMachineCard
                        key={productionLineMachine.machineId}
                        productionLineMachine={productionLineMachine}
                        canViewDetails={canViewMachineDetails}
                        canEdit={canEdit}
                        showArrow={null}
                      />
                    ))}
                  </div>
                </SortableContext>

                <div className="relative h-1 flex-1 ml-4">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-green-500" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile layout */}
        <div className="lg:hidden py-8">
          <div className="relative flex">
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-green-500" />

            <SortableContext items={machineOrder} strategy={horizontalListSortingStrategy}>
              <div className="flex flex-col gap-8 pl-8">
                {orderedMachines.map((productionLineMachine) => (
                  <div key={productionLineMachine.machineId} className="relative flex items-center">
                    <div className="absolute left-0 w-3 h-3 rounded-full bg-green-500 border-2 border-green-600 -translate-x-1/2" />
                    <div className="h-1 w-12 bg-green-500" />
                    <div className="flex-shrink-0 relative">
                      {canEdit && (
                        <div className="absolute -top-2 -left-2 z-20 bg-primary text-primary-foreground rounded-full p-1 cursor-grab active:cursor-grabbing shadow-md">
                          <GripVertical className="w-3 h-3" />
                        </div>
                      )}
                      <MachineCardInLine
                        machine={productionLineMachine.machine!}
                        canViewDetails={canViewMachineDetails}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SortableContext>
          </div>
        </div>

        {/* Drag overlay for visual feedback */}
        <DragOverlay>
          {activeMachine?.machine && (
            <div className="opacity-90">
              <MachineCardInLine machine={activeMachine.machine} canViewDetails={false} />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
