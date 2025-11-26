'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { GripVertical, Save } from 'lucide-react';
import { toast } from 'sonner';
import { getMachines } from '@/data/services/machines.api';
import { updateProductionLine } from '@/data/services/production-lines.api';
import type { ProductionLine } from '@/data/types/production-lines.types';
import type { Machine } from '@/data/types/machines.types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ConfigTabProps {
  productionLine: ProductionLine;
  onSuccess?: (updatedLine: ProductionLine) => void;
}

interface MachineWithBranch extends Machine {
  branchId: string;
  branch?: {
    id: string;
    name: string;
    companyId: string;
  };
}

interface SortableItemProps {
  id: string;
  index: number;
  machineName: string;
}

function SortableItem({ id, index, machineName }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center justify-between p-3 border rounded-lg bg-background cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors touch-none"
    >
      <div className="flex items-center gap-3">
        <GripVertical className="w-5 h-5 text-muted-foreground" />
        <span className="font-medium">
          {index + 1}. {machineName}
        </span>
      </div>
    </div>
  );
}

export function ConfigTab({ productionLine, onSuccess }: ConfigTabProps) {
  const t = useTranslations('productionLines');
  const [allMachines, setAllMachines] = useState<MachineWithBranch[]>([]);

  const initialMachineIds =
    productionLine.machines?.sort((a, b) => a.order - b.order).map((pm) => pm.machineId) || [];

  const [selectedMachineIds, setSelectedMachineIds] = useState<string[]>(initialMachineIds);
  const [machineOrder, setMachineOrder] = useState<string[]>(initialMachineIds);
  const [isLoadingMachines, setIsLoadingMachines] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Use the production line's branch instead of global context
  const availableMachines = allMachines.filter((m) => m.branch?.id === productionLine.branchId);

  useEffect(() => {
    const loadMachines = async () => {
      setIsLoadingMachines(true);
      try {
        const response = await getMachines();
        if (response.data) {
          setAllMachines(response.data as MachineWithBranch[]);
        } else if (response.errors) {
          console.error('Error loading machines:', response.errors);
          toast.error('Erro ao carregar máquinas');
        }
      } catch (error) {
        console.error('Error loading machines:', error);
        toast.error('Erro ao carregar máquinas');
      } finally {
        setIsLoadingMachines(false);
      }
    };

    loadMachines();
  }, []);

  const handleMachineToggle = (machineId: string, checked: boolean) => {
    if (checked) {
      setSelectedMachineIds((prev) => [...prev, machineId]);
      setMachineOrder((prev) => [...prev, machineId]);
    } else {
      setSelectedMachineIds((prev) => prev.filter((id) => id !== machineId));
      setMachineOrder((prev) => prev.filter((id) => id !== machineId));
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setMachineOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
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
        toast.success(t('configSaved'));
        onSuccess?.(response.data);
      }
    } catch (error) {
      toast.error(t('errorSaving'));
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('selectMachines')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingMachines ? (
              <p className="text-muted-foreground">Carregando máquinas...</p>
            ) : availableMachines.length === 0 ? (
              <p className="text-muted-foreground">{t('noMachinesAvailable')}</p>
            ) : (
              <div className="space-y-2">
                {availableMachines.map((machine) => (
                  <div key={machine.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={machine.id}
                      checked={selectedMachineIds.includes(machine.id)}
                      onCheckedChange={(checked) =>
                        handleMachineToggle(machine.id, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={machine.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {machine.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('machineOrder')}</CardTitle>
          </CardHeader>
          <CardContent>
            {machineOrder.length === 0 ? (
              <p className="text-muted-foreground text-xl">{t('noMachineSelected')}</p>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={machineOrder} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {machineOrder.map((machineId, index) => {
                      const machine = allMachines.find((m) => m.id === machineId);
                      return (
                        <SortableItem
                          key={machineId}
                          id={machineId}
                          index={index}
                          machineName={machine?.name || machineId}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? t('savingConfig') : t('saveConfig')}
        </Button>
      </div>
    </div>
  );
}
