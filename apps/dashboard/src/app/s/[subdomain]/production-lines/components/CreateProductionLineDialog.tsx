'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { useInternalRouter } from '@/hooks/useInternalRouter';
import { useCompanyUser } from '@/contexts/CompanyUserContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { createProductionLine } from '@/data/services/production-lines.api';
import { getMachinesByBranch } from '@/data/services/machines.api';
import type { ProductionLine } from '@/data/types/production-lines.types';
import { Loader2 } from 'lucide-react';

interface CreateProductionLineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (productionLine: ProductionLine) => void;
}

interface Machine {
  id: string;
  name: string;
  blueprintId: string;
  branchId: string;
  blueprint?: {
    id: string;
    name: string;
  };
}

export function CreateProductionLineDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateProductionLineDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMachines, setIsLoadingMachines] = useState(false);
  const [availableMachines, setAvailableMachines] = useState<Machine[]>([]);
  const [selectedMachineIds, setSelectedMachineIds] = useState<string[]>([]);
  const t = useTranslations('productionLines');
  const router = useInternalRouter();
  const { companyUser } = useCompanyUser();

  // Obter branchId do primeiro branch do usuário (pode ser melhorado para selecionar)
  const defaultBranchId = companyUser?.branches?.[0]?.branchId;

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, t('lineNameRequired')),
        branchId: z.string().min(1, 'Branch ID é obrigatório'),
      }),
    [t],
  );

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      branchId: defaultBranchId || '',
    },
  });

  const selectedBranchId = watch('branchId');

  // Carregar máquinas quando o branchId mudar
  useEffect(() => {
    const loadMachines = async () => {
      if (!selectedBranchId) return;

      setIsLoadingMachines(true);
      try {
        const response = await getMachinesByBranch(selectedBranchId);
        if (response.data) {
          setAvailableMachines(response.data);
        }
      } catch (error) {
        console.error('Erro ao carregar máquinas:', error);
        toast.error('Erro ao carregar máquinas disponíveis');
      } finally {
        setIsLoadingMachines(false);
      }
    };

    loadMachines();
  }, [selectedBranchId]);

  // Definir branchId padrão quando o usuário estiver disponível
  useEffect(() => {
    if (defaultBranchId && open) {
      setValue('branchId', defaultBranchId);
    }
  }, [defaultBranchId, setValue, open]);

  const toggleMachine = (machineId: string) => {
    setSelectedMachineIds((prev) =>
      prev.includes(machineId) ? prev.filter((id) => id !== machineId) : [...prev, machineId],
    );
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await createProductionLine({
        name: data.name,
        branchId: data.branchId,
        machineIds: selectedMachineIds,
        createdBy: companyUser?.id,
      });

      if (response.errors) {
        toast.error(t('createDialog.create') + ' falhou');
        return;
      }

      if (response.data) {
        toast.success(t('createDialog.create') + ' com sucesso!');
        reset();
        setSelectedMachineIds([]);
        onSuccess?.(response.data);
        // Redirecionar para página de detalhes na tab de config
        router.push(`/production-lines/${response.data.id}?tab=config`);
      }
    } catch (error) {
      toast.error('Erro ao criar linha de produção');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      if (!newOpen) {
        reset();
        setSelectedMachineIds([]);
      }
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('createDialog.title')}</DialogTitle>
          <DialogDescription>{t('createDialog.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6 py-4">
            {/* Nome da linha de produção */}
            <div className="space-y-2">
              <Label htmlFor="name">{t('lineName')}</Label>
              <Input
                id="name"
                placeholder={t('lineNamePlaceholder')}
                {...register('name')}
                disabled={isSubmitting}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            {/* Seleção de Branch (se o usuário tiver múltiplas branches) */}
            {companyUser && companyUser.branches && companyUser.branches.length > 1 && (
              <div className="space-y-2">
                <Label htmlFor="branchId">Filial</Label>
                <Select
                  value={selectedBranchId}
                  onValueChange={(value) => {
                    setValue('branchId', value);
                    setSelectedMachineIds([]); // Limpar seleção ao mudar de filial
                  }}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma filial" />
                  </SelectTrigger>
                  <SelectContent>
                    {companyUser.branches.map((branch) => (
                      <SelectItem key={branch.branchId} value={branch.branchId}>
                        {branch.branch?.name || branch.branchId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.branchId && (
                  <p className="text-sm text-destructive">{errors.branchId.message}</p>
                )}
              </div>
            )}

            {/* Seleção de Máquinas */}
            <div className="space-y-2">
              <Label>Máquinas (opcional)</Label>
              <p className="text-sm text-muted-foreground">
                Selecione as máquinas que farão parte desta linha de produção. Você também pode
                adicionar máquinas depois.
              </p>

              {isLoadingMachines ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Carregando máquinas...
                  </span>
                </div>
              ) : availableMachines.length === 0 ? (
                <div className="rounded-md border border-dashed p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Nenhuma máquina disponível nesta filial
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto rounded-md border p-4">
                  {availableMachines.map((machine) => (
                    <div key={machine.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`machine-${machine.id}`}
                        checked={selectedMachineIds.includes(machine.id)}
                        onCheckedChange={() => toggleMachine(machine.id)}
                        disabled={isSubmitting}
                      />
                      <label
                        htmlFor={`machine-${machine.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                      >
                        <div className="flex items-center justify-between">
                          <span>{machine.name}</span>
                          {machine.blueprint && (
                            <span className="text-xs text-muted-foreground">
                              {machine.blueprint.name}
                            </span>
                          )}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {selectedMachineIds.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedMachineIds.length} máquina{selectedMachineIds.length > 1 ? 's' : ''}{' '}
                  selecionada{selectedMachineIds.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              {t('createDialog.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                t('createDialog.create')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
