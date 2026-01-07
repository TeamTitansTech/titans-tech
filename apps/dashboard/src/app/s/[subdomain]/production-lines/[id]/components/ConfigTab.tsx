'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Save, Star } from 'lucide-react';
import { toast } from 'sonner';
import { getMachines } from '@/data/services/machines.api';
import { updateProductionLine } from '@/data/services/production-lines.api';
import type { ProductionLine } from '@/data/types/production-lines.types';
import type { Machine } from '@/data/types/machines.types';

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

export function ConfigTab({ productionLine, onSuccess }: ConfigTabProps) {
  const t = useTranslations('productionLines');
  const [allMachines, setAllMachines] = useState<MachineWithBranch[]>([]);

  // Get initial machine IDs preserving the existing order
  const initialMachineIds =
    productionLine.machines?.sort((a, b) => a.order - b.order).map((pm) => pm.machineId) || [];

  // The first machine in order is the main machine
  const initialMainMachine = initialMachineIds[0] || '';

  const [selectedMachineIds, setSelectedMachineIds] = useState<string[]>(initialMachineIds);
  const [mainMachineId, setMainMachineId] = useState<string>(initialMainMachine);
  const [isLoadingMachines, setIsLoadingMachines] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Use the production line's branch instead of global context
  const availableMachines = allMachines.filter((m) => m.branch?.id === productionLine.branchId);

  // Get selected machines for the main machine dropdown
  const selectedMachines = availableMachines.filter((m) => selectedMachineIds.includes(m.id));

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
    } else {
      setSelectedMachineIds((prev) => prev.filter((id) => id !== machineId));
      // If we're unchecking the main machine, clear the main machine selection
      if (machineId === mainMachineId) {
        setMainMachineId('');
      }
    }
  };

  const handleMainMachineChange = (machineId: string) => {
    setMainMachineId(machineId);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Reorder machines: main (order 0), then others
      let orderedMachineIds = [...selectedMachineIds];

      // Remove main from current position
      orderedMachineIds = orderedMachineIds.filter((id) => id !== mainMachineId);

      // Add main at the front (order 0)
      if (mainMachineId && selectedMachineIds.includes(mainMachineId)) {
        orderedMachineIds.unshift(mainMachineId);
      }

      const response = await updateProductionLine(productionLine.id, {
        machineIds: orderedMachineIds,
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
    <div className="space-y-6" data-testid="config-tab-container">
      <Card data-testid="config-machines-card">
        <CardHeader>
          <CardTitle data-testid="config-machines-title">{t('selectMachines')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingMachines ? (
            <p className="text-muted-foreground" data-testid="config-loading-message">
              Carregando máquinas...
            </p>
          ) : availableMachines.length === 0 ? (
            <p className="text-muted-foreground" data-testid="config-no-machines-message">
              {t('noMachinesAvailable')}
            </p>
          ) : (
            <div className="space-y-2" data-testid="config-machines-list">
              {availableMachines.map((machine) => (
                <div
                  key={machine.id}
                  className="flex items-center space-x-2"
                  data-testid={`config-machine-${machine.id}`}
                >
                  <Checkbox
                    id={machine.id}
                    checked={selectedMachineIds.includes(machine.id)}
                    onCheckedChange={(checked) =>
                      handleMachineToggle(machine.id, checked as boolean)
                    }
                    data-testid={`config-machine-checkbox-${machine.id}`}
                  />
                  <label
                    htmlFor={machine.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                    data-testid={`config-machine-label-${machine.id}`}
                  >
                    {machine.name}
                    {machine.id === mainMachineId && (
                      <Star
                        className="w-4 h-4 text-yellow-500 fill-yellow-500"
                        data-testid={`config-main-star-${machine.id}`}
                      />
                    )}
                  </label>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Machine Selection */}
      {selectedMachines.length > 0 && (
        <Card data-testid="config-main-machine-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" data-testid="config-main-machine-title">
              <Star className="w-5 h-5 text-yellow-500" />
              {t('mainMachine')}
            </CardTitle>
            <CardDescription data-testid="config-main-machine-description">
              {t('mainMachineDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={mainMachineId} onValueChange={handleMainMachineChange}>
              <SelectTrigger className="w-full" data-testid="config-main-machine-select">
                <SelectValue placeholder={t('selectMainMachine')} />
              </SelectTrigger>
              <SelectContent data-testid="config-main-machine-options">
                {selectedMachines.map((machine) => (
                  <SelectItem
                    key={machine.id}
                    value={machine.id}
                    data-testid={`config-main-option-${machine.id}`}
                  >
                    {machine.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} data-testid="config-save-button">
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? t('savingConfig') : t('saveConfig')}
        </Button>
      </div>
    </div>
  );
}
