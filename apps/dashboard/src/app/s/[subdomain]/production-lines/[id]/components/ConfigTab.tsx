'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Save } from 'lucide-react';
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

  const [selectedMachineIds, setSelectedMachineIds] = useState<string[]>(initialMachineIds);
  const [isLoadingMachines, setIsLoadingMachines] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
          toast.error(t('errorLoadingMachines'));
        }
      } catch (error) {
        console.error('Error loading machines:', error);
        toast.error(t('errorLoadingMachines'));
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
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await updateProductionLine(productionLine.id, {
        machineIds: selectedMachineIds,
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
      <Card>
        <CardHeader>
          <CardTitle>{t('selectMachines')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingMachines ? (
            <p className="text-muted-foreground">{t('loadingMachines')}</p>
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

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? t('savingConfig') : t('saveConfig')}
        </Button>
      </div>
    </div>
  );
}
