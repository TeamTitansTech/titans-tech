'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useBranch } from '@/contexts/BranchContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowUp, ArrowDown, Save } from 'lucide-react';
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
  const { selectedBranchId } = useBranch();
  const [allMachines, setAllMachines] = useState<MachineWithBranch[]>([]);

  const initialMachineIds =
    productionLine.machines?.sort((a, b) => a.order - b.order).map((pm) => pm.machineId) || [];

  const [selectedMachineIds, setSelectedMachineIds] = useState<string[]>(initialMachineIds);
  const [machineOrder, setMachineOrder] = useState<string[]>(initialMachineIds);
  const [isLoadingMachines, setIsLoadingMachines] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const availableMachines = allMachines.filter((m) => m.branch?.id === selectedBranchId);

  useEffect(() => {
    const loadMachines = async () => {
      setIsLoadingMachines(true);
      try {
        const response = await getMachines();
        if (response.data) {
          setAllMachines(response.data as MachineWithBranch[]);
          console.log('Loaded all machines:', response.data);
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

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...machineOrder];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setMachineOrder(newOrder);
  };

  const moveDown = (index: number) => {
    if (index === machineOrder.length - 1) return;
    const newOrder = [...machineOrder];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setMachineOrder(newOrder);
  };

  const handleSave = async () => {
    if (!selectedBranchId) {
      toast.error('Nenhuma filial selecionada');
      return;
    }

    if (productionLine.branchId !== selectedBranchId) {
      toast.error('Esta linha de produção pertence a outra filial');
      return;
    }

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
      toast.error('Erro ao salvar configurações');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!selectedBranchId) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">
            Por favor, selecione uma filial no menu superior para configurar linhas de produção.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (productionLine.branchId !== selectedBranchId) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">
            Esta linha de produção pertence a outra filial. Selecione a filial correta no menu
            superior para editá-la.
          </p>
        </CardContent>
      </Card>
    );
  }

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
              <div className="space-y-2">
                {machineOrder.map((machineId, index) => {
                  const machine = allMachines.find((m) => m.id === machineId);
                  return (
                    <div
                      key={machineId}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <span className="font-medium">
                        {index + 1}. {machine?.name || machineId}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moveUp(index)}
                          disabled={index === 0}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moveDown(index)}
                          disabled={index === machineOrder.length - 1}
                        >
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
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
