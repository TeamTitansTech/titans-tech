import { useState, useCallback } from 'react';
import { ServiceType } from '@/data/types/services.types';
import {
  YesNoNaDncType,
  YesNoDncType,
  DriveBeltConditionType,
  ProtectiveCoversStatusType,
} from '@titans-tech/shared/enums';
import { WhyNotCoveredType } from '@titans-tech/shared/types';

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

  // Inspection observation fields
  const [isPressLevel, setIsPressLevel] = useState<YesNoNaDncType | undefined>();
  const [driveBeltCondition, setDriveBeltConditionInternal] = useState<
    DriveBeltConditionType | undefined
  >();
  const [areAllProtectiveCovers, setAreAllProtectiveCoversInternal] = useState<
    ProtectiveCoversStatusType | undefined
  >();
  const [protectiveCoversExplanation, setProtectiveCoversExplanation] = useState<string>('');
  const [areCracksVisible, setAreCracksVisible] = useState<YesNoDncType | undefined>();
  const [cracksLocation, setCracksLocation] = useState<string>('');
  const [isMainMotorSecure, setIsMainMotorSecure] = useState<YesNoDncType | undefined>();
  const [isMotorPlateSecure, setIsMotorPlateSecure] = useState<YesNoDncType | undefined>();
  const [whyNotCovered, setWhyNotCoveredInternal] = useState<WhyNotCoveredType | undefined>();

  // Wrapper functions for Select components (which pass string values)
  const setDriveBeltCondition = useCallback((value: string) => {
    setDriveBeltConditionInternal(value ? (value as DriveBeltConditionType) : undefined);
  }, []);

  const setAreAllProtectiveCovers = useCallback((value: string) => {
    setAreAllProtectiveCoversInternal(value ? (value as ProtectiveCoversStatusType) : undefined);
  }, []);

  const setWhyNotCovered = useCallback((value: string) => {
    setWhyNotCoveredInternal(value ? (value as WhyNotCoveredType) : undefined);
  }, []);

  // Use the prop serviceType if provided (completing service), otherwise use internal state (creating new)
  const currentServiceType = serviceType || selectedServiceType;

  const reset = () => {
    setDate(getTomorrowDate());
    setSelectedServiceType(ServiceType.MAINTENANCE);
    setPerformedBy('');
    setIsSubmitting(false);
    setError(null);
    // Reset inspection fields
    setIsPressLevel(undefined);
    setDriveBeltConditionInternal(undefined);
    setAreAllProtectiveCoversInternal(undefined);
    setProtectiveCoversExplanation('');
    setAreCracksVisible(undefined);
    setCracksLocation('');
    setIsMainMotorSecure(undefined);
    setIsMotorPlateSecure(undefined);
    setWhyNotCoveredInternal(undefined);
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
    // Inspection observation fields
    isPressLevel,
    setIsPressLevel,
    driveBeltCondition,
    setDriveBeltCondition,
    areAllProtectiveCovers,
    setAreAllProtectiveCovers,
    protectiveCoversExplanation,
    setProtectiveCoversExplanation,
    areCracksVisible,
    setAreCracksVisible,
    cracksLocation,
    setCracksLocation,
    isMainMotorSecure,
    setIsMainMotorSecure,
    isMotorPlateSecure,
    setIsMotorPlateSecure,
    whyNotCovered,
    setWhyNotCovered,
    reset,
  };
}
