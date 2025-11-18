'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useCompanyUser } from '@/contexts/CompanyUserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowUp, ArrowDown, Save } from 'lucide-react';
import { toast } from 'sonner';
import { getMachines } from '@/data/services/machines.api';
import { updateProductionLine } from '@/data/services/production-lines.api';
import type { ProductionLine, MachineWithStatus } from '@/data/types/production-lines.types';
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
  const { companyUser } = useCompanyUser();
  const [selectedBranchId, setSelectedBranchId] = useState(productionLine.branchId || '');
  const [allMachines, setAllMachines] = useState<MachineWithBranch[]>([]);
  const [selectedMachineIds, setSelectedMachineIds] = useState<string[]>(
    productionLine.machineIds || [],
  );
  const [machineOrder, setMachineOrder] = useState<string[]>(productionLine.machineIds || []);
  const [isLoadingMachines, setIsLoadingMachines] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const branches = companyUser?.branches?.map((ub) => ub.branch) || [];

  console.log('ConfigTab Branches:', {
    companyUser,
    branches: branches.map(b => ({ id: b.id, name: b.name })),
    selectedBranchId,
  });

  const availableMachines = allMachines.filter((m) => m.branch?.id === selectedBranchId);

  // Debug logs
  console.log('ConfigTab Debug:', {
    selectedBranchId,
    allMachinesCount: allMachines.length,
    availableMachinesCount: availableMachines.length,
    allMachines: allMachines.map(m => ({ id: m.id, name: m.name, branchId: m.branchId, branchObjectId: m.branch?.id })),
    availableMachines: availableMachines.map(m => ({ id: m.id, name: m.name, branchId: m.branchId, branchObjectId: m.branch?.id })),
  });

  // Load all machines once
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
      toast.error('Selecione uma filial primeiro');
      return;
    }

    setIsSaving(true);
    try {
      const response = await updateProductionLine(productionLine.id, {
        branchId: selectedBranchId,
        machineIds: machineOrder,
      });

      if (response.errors) {
        toast.error(t('errorSaving'));
        return;
      }

      // Buscar as máquinas completas para passar ao callback
      const selectedMachines: MachineWithStatus[] = machineOrder
        .map((id) => allMachines.find((m) => m.id === id))
        .filter((m) => m !== undefined)
        .map((machine) => ({
          ...machine,
          sectionStatus: {}, // Initialize empty status for now
        }));

      // Criar o objeto atualizado com as máquinas completas
      const updatedLine: ProductionLine = {
        ...productionLine,
        branchId: selectedBranchId,
        machineIds: machineOrder,
        machines: selectedMachines,
      };

      toast.success(t('configSaved'));
      onSuccess?.(updatedLine);
    } catch (error) {
      toast.error('Erro ao salvar configurações');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('selectBranch')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t('selectBranch')}</Label>
            {!companyUser ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : branches.length === 0 ? (
              <p className="text-sm text-destructive">Nenhuma filial disponível</p>
            ) : (
              <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma filial" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                      {branch.location && ` - ${branch.location}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedBranchId && (
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

          {machineOrder.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('machineOrder')}</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving || !selectedBranchId}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? t('savingConfig') : t('saveConfig')}
        </Button>
      </div>
    </div>
  );
}
