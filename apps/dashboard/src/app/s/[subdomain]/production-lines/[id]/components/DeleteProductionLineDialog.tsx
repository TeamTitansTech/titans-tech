'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useInternalRouter } from '@/hooks/useInternalRouter';
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
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { deleteProductionLine } from '@/data/services/production-lines.api';
import type { ProductionLine } from '@/data/types/production-lines.types';

interface DeleteProductionLineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productionLine: ProductionLine;
}

export function DeleteProductionLineDialog({
  open,
  onOpenChange,
  productionLine,
}: DeleteProductionLineDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const t = useTranslations('productionLines.deleteDialog');
  const router = useInternalRouter();

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await deleteProductionLine(productionLine.id);

      if (response.errors) {
        toast.error(t('error'));
        setIsDeleting(false);
        return;
      }

      toast.success(t('success'));
      onOpenChange(false);
      router.push('/production-lines');
      router.refresh();
    } catch (error) {
      console.error('Error deleting production line:', error);
      toast.error(t('error'));
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <DialogTitle>{t('title')}</DialogTitle>
              <DialogDescription className="mt-1">{t('description')}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogBody>
          <div className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
            <p className="text-sm text-red-800 dark:text-red-300">
              {t('warningMessage', { name: productionLine.name })}
            </p>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            {t('cancel')}
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? t('deleting') : t('confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
