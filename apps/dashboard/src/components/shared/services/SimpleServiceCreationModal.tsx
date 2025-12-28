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
  DialogBody,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ServiceType, type CreateServicePayload } from '@/data/types/services.types';
import { createService } from '@/data/services/services.api';
import { useInternalRouter } from '@/hooks/useInternalRouter';

interface SimpleServiceCreationModalProps {
  machineId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceRequestId?: string; // Optional: if creating from a service request
  onServiceCreated?: () => void; // Optional: callback after service is created
}

export default function SimpleServiceCreationModal({
  machineId,
  open,
  onOpenChange,
  serviceRequestId,
  onServiceCreated,
}: SimpleServiceCreationModalProps) {
  const t = useTranslations('services');
  const tActions = useTranslations('actions');
  const router = useInternalRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default to tomorrow's date so new services appear in Upcoming Services
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };

  const [date, setDate] = useState<Date>(getTomorrowDate());
  const [serviceType, setServiceType] = useState<ServiceType>(ServiceType.INSPECTION);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload: CreateServicePayload = {
        machineId,
        date: date.toISOString(),
        type: serviceType,
        ...(serviceRequestId && { serviceRequestId }),
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

      // Call the callback if provided
      if (onServiceCreated) {
        onServiceCreated();
      }

      router.refresh();
    } catch (err) {
      console.error('Error creating service:', err);
      setError('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md sm:w-auto">
        <DialogHeader>
          <DialogTitle>{t('createNewService')}</DialogTitle>
          <DialogDescription>{t('createServiceDescription')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="date">{t('serviceDate')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => {
                      if (newDate) {
                        setDate(newDate);
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">{t('serviceType')}</Label>
              <Select
                value={serviceType}
                onValueChange={(value) => setServiceType(value as ServiceType)}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ServiceType.INSPECTION}>{t('types.inspection')}</SelectItem>
                  <SelectItem value={ServiceType.MAINTENANCE}>{t('types.maintenance')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="rounded-md border border-destructive p-2 text-sm text-destructive">
                {error}
              </div>
            )}
          </DialogBody>

          <DialogFooter className="gap-y-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {tActions('cancel')}
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
