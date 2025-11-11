'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ServiceType, type CreateServicePayload } from '@/data/types/services.types';
import { createService } from '@/data/services/services.api';
import { useInternalRouter } from '@/hooks/useInternalRouter';

interface SimpleServiceCreationModalProps {
  machineId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SimpleServiceCreationModal({
  machineId,
  open,
  onOpenChange,
}: SimpleServiceCreationModalProps) {
  const t = useTranslations('services');
  const router = useInternalRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default to tomorrow's date so new services appear in Upcoming Services
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const [date, setDate] = useState(getTomorrowDate());
  const [serviceType, setServiceType] = useState<ServiceType>(ServiceType.INSPECTION);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload: CreateServicePayload = {
        machineId,
        date: new Date(date).toISOString(),
        type: serviceType,
      };

      const response = await createService(payload);

      if (response.errors) {
        setError(response.errors.join(', '));
        setIsSubmitting(false);
        return;
      }

      // Reset form and close modal
      setDate(getTomorrowDate());
      setServiceType(ServiceType.INSPECTION);
      setIsSubmitting(false);
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      console.error('Error creating service:', err);
      setError('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('createNewService')}</DialogTitle>
          <DialogDescription>{t('createServiceDescription')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date">{t('serviceDate')}</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">{t('serviceType')}</Label>
              <Select
                value={serviceType}
                onValueChange={(value) => setServiceType(value as ServiceType)}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value={ServiceType.INSPECTION}>{t('types.inspection')}</SelectItem>
                  <SelectItem value={ServiceType.MAINTENANCE}>{t('types.maintenance')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="text-sm text-destructive border border-destructive rounded-md p-2">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('creating') : t('createService')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
