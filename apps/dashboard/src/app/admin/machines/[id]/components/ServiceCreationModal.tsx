'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { createService } from '@/data/services/services.api';
import { ServiceType, type ServiceCreationModalProps } from '@/data/types/services.types';

export default function ServiceCreationModal({
  machineId,
  open,
  onOpenChange,
}: ServiceCreationModalProps) {
  const t = useTranslations('MachineDetails');
  const [date, setDate] = useState<string>('');
  const [serviceType, setServiceType] = useState<ServiceType>(ServiceType.INSPECTION);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      toast.error(t('serviceCreation.errors.dateRequired'));
      return;
    }

    setIsSubmitting(true);

    try {
      await createService({
        machineId,
        date,
        type: serviceType,
      });

      toast.success(t('serviceCreation.success'));
      onOpenChange(false);

      // Reset form
      setDate('');
      setServiceType(ServiceType.INSPECTION);

      // Reload the page to show the new service
      window.location.reload();
    } catch (error) {
      console.error('Error creating service:', error);
      toast.error(t('serviceCreation.errors.createFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('serviceCreation.title')}</DialogTitle>
          <DialogDescription>{t('serviceCreation.description')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date">{t('serviceCreation.date')}</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="serviceType"
                checked={serviceType === ServiceType.MAINTENANCE}
                onCheckedChange={(checked) =>
                  setServiceType(checked ? ServiceType.MAINTENANCE : ServiceType.INSPECTION)
                }
              />
              <Label
                htmlFor="serviceType"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t('serviceCreation.isMaintenance')}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t('serviceCreation.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('serviceCreation.creating') : t('serviceCreation.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
