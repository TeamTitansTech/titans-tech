'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { useInternalRouter } from '@/hooks/useInternalRouter';
import { useBranch } from '@/contexts/BranchContext';
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
import { toast } from 'sonner';
import { createProductionLine } from '@/data/services/production-lines.api';
import type { ProductionLine } from '@/data/types/production-lines.types';
import { Loader2 } from 'lucide-react';

interface CreateProductionLineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (productionLine: ProductionLine) => void;
}

export function CreateProductionLineDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateProductionLineDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations('productionLines');
  const router = useInternalRouter();
  const { selectedBranchId } = useBranch();
  const { companyUser } = useCompanyUser();

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, t('lineNameRequired')),
      }),
    [t],
  );

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!selectedBranchId) {
      toast.error('Selecione uma filial no menu superior');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createProductionLine({
        name: data.name,
        branchId: selectedBranchId,
        machineIds: [],
        createdBy: companyUser?.id,
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
        reset();
      }
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
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

            <p className="text-sm text-muted-foreground">
              Você poderá adicionar máquinas à linha após a criação, na aba de configuração.
            </p>
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
