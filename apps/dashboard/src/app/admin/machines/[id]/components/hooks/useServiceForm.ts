import { useState, useCallback } from 'react';
import { ServiceType } from '@/data/types/services.types';

const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
};

export function useServiceForm(
  serviceType?: ServiceType,
  initialDate?: string,
  initialPerformedBy?: string,
) {
  const getInitialDate = useCallback(() => {
    if (initialDate) {
      return new Date(initialDate);
    }
    return getTomorrowDate();
  }, [initialDate]);

  const [date, setDate] = useState<Date>(getInitialDate());
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType>(
    serviceType || ServiceType.MAINTENANCE,
  );
  const [performedBy, setPerformedBy] = useState(initialPerformedBy || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use the prop serviceType if provided (completing service), otherwise use internal state (creating new)
  const currentServiceType = serviceType || selectedServiceType;

  const reset = () => {
    setDate(getTomorrowDate());
    setSelectedServiceType(ServiceType.MAINTENANCE);
    setPerformedBy('');
    setIsSubmitting(false);
    setError(null);
  };

  return {
    date,
    setDate,
    performedBy,
    setPerformedBy,
    selectedServiceType,
    setSelectedServiceType,
    currentServiceType,
    isSubmitting,
    setIsSubmitting,
    error,
    setError,
    reset,
  };
}
