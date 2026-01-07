'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { useInternalRouter } from '@/hooks/useInternalRouter';
import { useCompanyUser } from '@/contexts/CompanyUserContext';
import { useSysAdmin } from '@/contexts/SysAdminContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogBody,
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
import { toast } from 'sonner';
import { createProductionLine } from '@/data/services/production-lines.api';
import type { ProductionLine } from '@/data/types/production-lines.types';
import { Loader2, MapPin } from 'lucide-react';

interface BranchOption {
  id: string;
  name: string;
  location?: string | null;
  machineCount: number;
}

interface CreateProductionLineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (productionLine: ProductionLine) => void;
  branches: BranchOption[];
  preselectedBranchId?: string;
}

export function CreateProductionLineDialog({
  open,
  onOpenChange,
  onSuccess,
  branches,
  preselectedBranchId,
}: CreateProductionLineDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations('productionLines');
  const router = useInternalRouter();
  const { companyUser } = useCompanyUser();
  const { sysAdminUser } = useSysAdmin();

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, t('lineNameRequired')),
        branchId: z.string().min(1, t('selectBranchRequired') || 'Selecione uma filial'),
      }),
    [t],
  );

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      branchId: preselectedBranchId || '',
    },
  });

  // Update branchId when preselectedBranchId changes
  useEffect(() => {
    if (preselectedBranchId) {
      setValue('branchId', preselectedBranchId);
    }
  }, [preselectedBranchId, setValue]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await createProductionLine({
        name: data.name,
        branchId: data.branchId,
        machineIds: [],
        createdBy: sysAdminUser?.id || companyUser?.id,
      });

      if (response.errors) {
        toast.error(t('createDialog.create') + ' falhou');
        return;
      }

      if (response.data) {
        toast.success(t('createDialog.create') + ' com sucesso!');
        reset();
        onSuccess?.(response.data);
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
        reset({ branchId: preselectedBranchId || '' });
      }
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="lg:max-w-[500px]" data-testid="create-production-line-dialog">
        <DialogHeader>
          <DialogTitle data-testid="create-production-line-title">
            {t('createDialog.title')}
          </DialogTitle>
          <DialogDescription data-testid="dialog-description">
            {t('createDialog.description')}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
          data-testid="dialog-form"
        >
          <DialogBody className="space-y-6 py-4">
            {/* Branch selection */}
            <div className="space-y-2">
              <Label data-testid="dialog-branch-label">{t('selectBranch') || 'Filial'}</Label>
              <Controller
                name="branchId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-full" data-testid="dialog-branch-select">
                      <MapPin className="mr-2 h-4 w-4 shrink-0" />
                      <SelectValue
                        placeholder={t('selectBranchPlaceholder') || 'Selecione uma filial'}
                      />
                    </SelectTrigger>
                    <SelectContent data-testid="dialog-branch-options">
                      {branches.map((branch) => (
                        <SelectItem
                          key={branch.id}
                          value={branch.id}
                          textValue={branch.name}
                          data-testid={`dialog-branch-option-${branch.id}`}
                        >
                          <div className="flex flex-col">
                            <div className="flex items-center justify-between gap-2">
                              <span>{branch.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {branch.machineCount}{' '}
                                {branch.machineCount === 1 ? 'machine' : 'machines'}
                              </span>
                            </div>
                            {branch.location && (
                              <span className="max-w-[250px] truncate text-xs text-muted-foreground">
                                {branch.location}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.branchId && (
                <p className="text-sm text-destructive">{errors.branchId.message}</p>
              )}
            </div>

            {/* Nome da linha de produção */}
            <div className="space-y-2">
              <Label htmlFor="name" data-testid="dialog-name-label">
                {t('lineName')}
              </Label>
              <Input
                id="name"
                placeholder={t('lineNamePlaceholder')}
                {...register('name')}
                disabled={isSubmitting}
                data-testid="dialog-name-input"
              />
              {errors.name && (
                <p className="text-sm text-destructive" data-testid="dialog-name-error">
                  {errors.name.message}
                </p>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              Você poderá adicionar máquinas à linha após a criação, na aba de configuração.
            </p>
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
              data-testid="dialog-cancel-button"
            >
              {t('createDialog.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting} data-testid="dialog-submit-button">
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
