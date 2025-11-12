'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { updateService } from '@/data/services/services.api';
import {
  ServiceType,
  ServiceStatus,
  MatingPartType,
  type BearingClearanceData,
  type UpdateServicePayload,
  type ServiceCreationModalProps,
} from '@/data/types/services.types';
import { BearingClearanceForm } from './forms/BearingClearanceForm';
import { SlideSection, type SlideSectionRef } from './sections/SlideSection';
import { GibsSection, type GibsSectionRef } from './sections/GibsSection';
import {
  LubricationHydraulicsSection,
  type LubricationHydraulicsSectionRef,
} from './sections/LubricationHydraulicsSection';
import { ClutchSection, type ClutchSectionRef } from './sections/ClutchSection';
import {
  CounterbalanceCylinderSection,
  type CounterbalanceCylinderSectionRef,
} from './sections/CounterbalanceCylinderSection';
import { Checkbox } from '@radix-ui/react-checkbox';

// Default data structures
const defaultBearingData: BearingClearanceData = {
  totalClearance_RH: 0,
  totalClearance_LH: 0,
  mainBearings_RH: 0,
  mainBearings_LH: 0,
  upperConnectionBearings_RH: 0,
  upperConnectionBearings_LH: 0,
  wristPinToMatingPart_RH: 0,
  wristPinToMatingPart_LH: 0,
  wristPinToBushing_RH: 0,
  wristPinToBushing_LH: 0,
  slideAdjNutToScrewSleeve_RH: 0,
  slideAdjNutToScrewSleeve_LH: 0,
  extraDoubleLockOpen_RH: 0,
  extraDoubleLockOpen_LH: 0,
  ballBoxArea_RH: 0,
  ballBoxArea_LH: 0,
  hasBeenAdjusted: false,
  combinedWith: '',
  matingPart: MatingPartType.BUSHING,
  slideMotorMounts: '',
  powerCordHoses: '',
  chainsGearsSprockets: '',
  lockingClamps: '',
  notes: '',
};

// Validation helper functions
const isDataTouched = <T extends object>(data: T, defaultData: T): boolean => {
  return (Object.keys(data) as Array<keyof T>).some((key) => {
    const dataValue = data[key];
    const defaultValue = defaultData[key];

    // Check if value differs from default
    if (typeof dataValue === 'number' && typeof defaultValue === 'number') {
      return dataValue !== defaultValue;
    }
    if (typeof dataValue === 'string' && typeof defaultValue === 'string') {
      return dataValue.trim() !== defaultValue.trim();
    }
    if (typeof dataValue === 'boolean' && typeof defaultValue === 'boolean') {
      return dataValue !== defaultValue;
    }
    if (dataValue === undefined || dataValue === null) {
      return defaultValue !== undefined && defaultValue !== null;
    }
    return dataValue !== defaultValue;
  });
};

const validateBearingClearanceData = (data: BearingClearanceData): string[] => {
  const errors: string[] = [];
  const requiredNumericFields: (keyof BearingClearanceData)[] = [
    'totalClearance_RH',
    'totalClearance_LH',
    'mainBearings_RH',
    'mainBearings_LH',
    'upperConnectionBearings_RH',
    'upperConnectionBearings_LH',
    'wristPinToMatingPart_RH',
    'wristPinToMatingPart_LH',
    'wristPinToBushing_RH',
    'wristPinToBushing_LH',
    'slideAdjNutToScrewSleeve_RH',
    'slideAdjNutToScrewSleeve_LH',
    'extraDoubleLockOpen_RH',
    'extraDoubleLockOpen_LH',
    'ballBoxArea_RH',
    'ballBoxArea_LH',
  ];

  requiredNumericFields.forEach((field) => {
    const value = data[field];
    if (typeof value !== 'number' || isNaN(value)) {
      errors.push(`${String(field)} is required and must be a valid number`);
    }
  });

  return errors;
};

interface CompleteServiceModalProps extends ServiceCreationModalProps {
  serviceId: string; // ID of the service to complete
  serviceType: ServiceType; // Type of the service being completed
  initialDate?: string; // Initial date from the service
  initialPerformedBy?: string; // Initial performedBy from the service
}

export function CompleteServiceModal({
  machineId,
  blueprintSections,
  serviceId,
  serviceType,
  initialDate,
  initialPerformedBy,
  open,
  onOpenChange,
}: CompleteServiceModalProps) {
  console.log(blueprintSections);
  const t = useTranslations('inspections');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [includeBeforeData, setIncludeBeforeData] = useState(false);
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [performedBy, setPerformedBy] = useState(initialPerformedBy || '');

  // Track which sections have been touched
  const [touchedSections, setTouchedSections] = useState<Set<string>>(new Set());

  // Collapsible section states
  const [bearingClearanceOpen, setBearingClearanceOpen] = useState(true);
  const [slideOpen, setSlideOpen] = useState(false);
  const [gibsOpen, setGibsOpen] = useState(false);
  const [lubricationOpen, setLubricationOpen] = useState(false);
  const [clutchOpen, setClutchOpen] = useState(false);
  const [counterbalanceOpen, setCounterbalanceOpen] = useState(false);

  // Section refs
  const slideRef = useRef<SlideSectionRef>(null);
  const gibsRef = useRef<GibsSectionRef>(null);
  const lubricationRef = useRef<LubricationHydraulicsSectionRef>(null);
  const clutchRef = useRef<ClutchSectionRef>(null);
  const counterbalanceRef = useRef<CounterbalanceCylinderSectionRef>(null);

  // Bearing Clearance state
  const [outerBeforeData, setOuterBeforeData] = useState<BearingClearanceData>(defaultBearingData);
  const [outerAfterData, setOuterAfterData] = useState<BearingClearanceData>(defaultBearingData);
  const [innerBeforeData, setInnerBeforeData] = useState<BearingClearanceData>(defaultBearingData);
  const [innerAfterData, setInnerAfterData] = useState<BearingClearanceData>(defaultBearingData);

  // Shared Bearing Clearance fields (outside tabs)
  const [sharedBearingFields, setSharedBearingFields] = useState({
    hasBeenAdjusted: false,
    combinedWith: '',
    matingPart: MatingPartType.BUSHING,
    slideMotorMounts: '',
    powerCordHoses: '',
    chainsGearsSprockets: '',
    lockingClamps: '',
    notes: '',
  });

  const [outerBeforeErrors, setOuterBeforeErrors] = useState<Record<string, string>>({});
  const [outerAfterErrors, setOuterAfterErrors] = useState<Record<string, string>>({});
  const [innerBeforeErrors, setInnerBeforeErrors] = useState<Record<string, string>>({});
  const [innerAfterErrors, setInnerAfterErrors] = useState<Record<string, string>>({});
  const [dateError, setDateError] = useState<string>('');

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setIncludeBeforeData(false);
      setDate(initialDate || new Date().toISOString().split('T')[0]);
      setPerformedBy(initialPerformedBy || '');
      setTouchedSections(new Set());
      setOuterBeforeData(defaultBearingData);
      setOuterAfterData(defaultBearingData);
      setInnerBeforeData(defaultBearingData);
      setInnerAfterData(defaultBearingData);
      setSharedBearingFields({
        hasBeenAdjusted: false,
        combinedWith: '',
        matingPart: MatingPartType.BUSHING,
        slideMotorMounts: '',
        powerCordHoses: '',
        chainsGearsSprockets: '',
        lockingClamps: '',
        notes: '',
      });
      setOuterBeforeErrors({});
      setOuterAfterErrors({});
      setInnerBeforeErrors({});
      setInnerAfterErrors({});
      setDateError('');
      // Reset section refs
      slideRef.current?.reset();
      gibsRef.current?.reset();
      lubricationRef.current?.reset();
      clutchRef.current?.reset();
      counterbalanceRef.current?.reset();
    }
  }, [open, initialDate, initialPerformedBy]);

  // Mark section as touched when user interacts with it
  const markSectionTouched = (section: string) => {
    setTouchedSections((prev) => new Set(prev).add(section));
  };

  // Update functions with touch tracking
  const updateOuterBeforeField = (
    field: keyof BearingClearanceData,
    value: string | number | boolean,
  ) => {
    setOuterBeforeData((prev) => ({ ...prev, [field]: value }));
    setOuterBeforeErrors((prev) => ({ ...prev, [field]: '' }));
    markSectionTouched('BEARING_CLEARANCE');
  };

  const updateOuterAfterField = (
    field: keyof BearingClearanceData,
    value: string | number | boolean,
  ) => {
    setOuterAfterData((prev) => ({ ...prev, [field]: value }));
    setOuterAfterErrors((prev) => ({ ...prev, [field]: '' }));
    markSectionTouched('BEARING_CLEARANCE');
  };

  const updateInnerBeforeField = (
    field: keyof BearingClearanceData,
    value: string | number | boolean,
  ) => {
    setInnerBeforeData((prev) => ({ ...prev, [field]: value }));
    setInnerBeforeErrors((prev) => ({ ...prev, [field]: '' }));
    markSectionTouched('BEARING_CLEARANCE');
  };

  const updateInnerAfterField = (
    field: keyof BearingClearanceData,
    value: string | number | boolean,
  ) => {
    setInnerAfterData((prev) => ({ ...prev, [field]: value }));
    setInnerAfterErrors((prev) => ({ ...prev, [field]: '' }));
    markSectionTouched('BEARING_CLEARANCE');
  };

  // Validation on blur (basic field validation)
  const validateField = (
    field: keyof BearingClearanceData,
    value: string | number | boolean | undefined,
  ): string => {
    if (field === 'combinedWith' || field === 'matingPart' || field === 'hasBeenAdjusted') {
      return '';
    }

    const numValue = Number(value);
    if (isNaN(numValue)) {
      return t('form.error.invalidNumber');
    }

    return '';
  };

  // Blur handlers
  const handleBlurOuterBefore = (field: keyof BearingClearanceData) => {
    const error = validateField(field, outerBeforeData[field]);
    setOuterBeforeErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleBlurOuterAfter = (field: keyof BearingClearanceData) => {
    const error = validateField(field, outerAfterData[field]);
    setOuterAfterErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleBlurInnerBefore = (field: keyof BearingClearanceData) => {
    const error = validateField(field, innerBeforeData[field]);
    setInnerBeforeErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleBlurInnerAfter = (field: keyof BearingClearanceData) => {
    const error = validateField(field, innerAfterData[field]);
    setInnerAfterErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleDateBlur = () => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (selectedDate > today) {
      setDateError(t('form.error.futureDate'));
    } else {
      setDateError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate date
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      if (selectedDate > today) {
        toast.error(t('form.error.futureDate'));
        setIsSubmitting(false);
        return;
      }

      const validationErrors: string[] = [];

      // Check if touched sections and validate accordingly
      if (
        touchedSections.has('BEARING_CLEARANCE') &&
        blueprintSections.includes('BEARING_CLEARANCE')
      ) {
        const outerBeforeTouched = isDataTouched(outerBeforeData, defaultBearingData);
        const outerAfterTouched = isDataTouched(outerAfterData, defaultBearingData);
        const innerBeforeTouched = isDataTouched(innerBeforeData, defaultBearingData);
        const innerAfterTouched = isDataTouched(innerAfterData, defaultBearingData);

        if (serviceType === ServiceType.MAINTENANCE && includeBeforeData) {
          // For maintenance with "before" data: require all "before" sections
          if (!outerBeforeTouched || !innerBeforeTouched) {
            validationErrors.push(
              'Bearing Clearance: When including "Initial" measurements, you must fill all "Initial" sections (Outer Initial and Inner Initial)',
            );
          } else {
            validationErrors.push(
              ...validateBearingClearanceData(outerBeforeData).map((e) => `Outer Initial: ${e}`),
            );
            validationErrors.push(
              ...validateBearingClearanceData(innerBeforeData).map((e) => `Inner Initial: ${e}`),
            );
          }
        }

        // Always validate "after" sections if touched
        if (outerAfterTouched) {
          validationErrors.push(
            ...validateBearingClearanceData(outerAfterData).map((e) => `Outer After: ${e}`),
          );
        }
        if (innerAfterTouched) {
          validationErrors.push(
            ...validateBearingClearanceData(innerAfterData).map((e) => `Inner After: ${e}`),
          );
        }

        // For inspection or maintenance without "before" data: require at least one "after" section
        if (
          (serviceType === ServiceType.INSPECTION ||
            (serviceType === ServiceType.MAINTENANCE && !includeBeforeData)) &&
          !outerAfterTouched &&
          !innerAfterTouched
        ) {
          validationErrors.push(
            'Bearing Clearance: You must fill at least one "After Adjustment" section (Outer After or Inner After)',
          );
        }
      }

      // Slide validation is now handled in the validateAndGetData method

      // Gibs validation
      if (blueprintSections.includes('GIBS') && gibsRef.current?.isTouched()) {
        const gibsResult = gibsRef.current.validateAndGetData(serviceType);
        if (!gibsResult.isValid) {
          validationErrors.push(...gibsResult.errors);
        }
      }

      // Lubrication Hydraulics validation
      if (
        blueprintSections.includes('LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER') &&
        lubricationRef.current?.isTouched()
      ) {
        const lubricationResult = lubricationRef.current.validateAndGetData(serviceType);
        if (!lubricationResult.isValid) {
          validationErrors.push(...lubricationResult.errors);
        }
      }

      // Clutch validation
      if (blueprintSections.includes('CLUTCH') && clutchRef.current?.isTouched()) {
        const clutchResult = clutchRef.current.validateAndGetData(serviceType);
        if (!clutchResult.isValid) {
          validationErrors.push(...clutchResult.errors);
        }
      }

      // Counterbalance Cylinder validation
      if (
        blueprintSections.includes('COUNTERBALANCE_CYLINDER_AIRBAG') &&
        counterbalanceRef.current?.isTouched()
      ) {
        const counterbalanceResult = counterbalanceRef.current.validateAndGetData(serviceType);
        if (!counterbalanceResult.isValid) {
          validationErrors.push(...counterbalanceResult.errors);
        }
      }

      if (validationErrors.length > 0) {
        toast.error(validationErrors.join('\n\n'));
        setIsSubmitting(false);
        return;
      }

      // Build payload - only include touched sections
      const payload: UpdateServicePayload = {
        date: new Date(date).toISOString(),
        type: serviceType,
        performedBy: performedBy || undefined,
      };

      // Only add bearing clearance if section was touched
      if (
        touchedSections.has('BEARING_CLEARANCE') &&
        blueprintSections.includes('BEARING_CLEARANCE')
      ) {
        const outerBeforeTouched = isDataTouched(outerBeforeData, defaultBearingData);
        const outerAfterTouched = isDataTouched(outerAfterData, defaultBearingData);
        const innerBeforeTouched = isDataTouched(innerBeforeData, defaultBearingData);
        const innerAfterTouched = isDataTouched(innerAfterData, defaultBearingData);

        // Apply shared fields to all bearing clearance data objects
        const outerBeforeWithShared = outerBeforeTouched
          ? { ...outerBeforeData, ...sharedBearingFields }
          : undefined;
        const outerAfterWithShared = outerAfterTouched
          ? { ...outerAfterData, ...sharedBearingFields }
          : undefined;
        const innerBeforeWithShared = innerBeforeTouched
          ? { ...innerBeforeData, ...sharedBearingFields }
          : undefined;
        const innerAfterWithShared = innerAfterTouched
          ? { ...innerAfterData, ...sharedBearingFields }
          : undefined;

        payload.bearingClearance = {
          outerBefore: outerBeforeWithShared,
          outerAfter: outerAfterWithShared,
          innerBefore: innerBeforeWithShared,
          innerAfter: innerAfterWithShared,
        };
      }

      // Only add slide if section was touched
      if (blueprintSections.includes('SLIDE') && slideRef.current?.isTouched()) {
        const slideResult = slideRef.current.validateAndGetData(serviceType);
        if (!slideResult.isValid) {
          validationErrors.push(...slideResult.errors);
        } else if (slideResult.data) {
          payload.slide = slideResult.data;
        }
      }

      // Add gibs data if validated successfully
      if (blueprintSections.includes('GIBS') && gibsRef.current?.isTouched()) {
        const gibsResult = gibsRef.current.validateAndGetData(serviceType);
        if (gibsResult.isValid && gibsResult.data) {
          payload.gibs = gibsResult.data;
        }
      }

      // Add lubrication hydraulics data if validated successfully
      if (
        blueprintSections.includes('LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER') &&
        lubricationRef.current?.isTouched()
      ) {
        const lubricationResult = lubricationRef.current.validateAndGetData(serviceType);
        if (lubricationResult.isValid && lubricationResult.data) {
          payload.lubricationHydraulics = lubricationResult.data;
        }
      }

      // Add clutch data if validated successfully
      if (blueprintSections.includes('CLUTCH') && clutchRef.current?.isTouched()) {
        const clutchResult = clutchRef.current.validateAndGetData(serviceType);
        if (clutchResult.isValid && clutchResult.data) {
          payload.clutch = clutchResult.data;
        }
      }

      // Add counterbalance cylinder data if validated successfully
      if (
        blueprintSections.includes('COUNTERBALANCE_CYLINDER_AIRBAG') &&
        counterbalanceRef.current?.isTouched()
      ) {
        const counterbalanceResult = counterbalanceRef.current.validateAndGetData(serviceType);
        if (counterbalanceResult.isValid && counterbalanceResult.data) {
          payload.counterbalanceCylinder = counterbalanceResult.data;
        }
      }

      // Create update payload for PUT request
      const updatePayload: UpdateServicePayload = {
        date: payload.date,
        type: payload.type,
        status: ServiceStatus.COMPLETED, // Mark as completed when filling data
        performedBy: payload.performedBy,
        bearingClearance: payload.bearingClearance,
        slide: payload.slide,
        gibs: payload.gibs,
        lubricationHydraulics: payload.lubricationHydraulics,
        clutch: payload.clutch,
        counterbalanceCylinder: payload.counterbalanceCylinder,
      };

      const response = await updateService(serviceId, updatePayload, machineId);

      if (response.errors) {
        toast.error(t('form.error.title') + ' ' + response.errors.join(', '));
      } else {
        toast.success('Service completed successfully');
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error completing service:', error);
      toast.error(t('form.error.title') + ' ' + String(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Inspection Details Section */}
          <div className="border rounded-lg p-6 bg-slate-50">
            <h3 className="text-base font-semibold mb-4">Inspection Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">{t('form.date.label')}</Label>
                <Input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  onBlur={handleDateBlur}
                  className={`mt-1 ${dateError ? 'border-destructive' : ''}`}
                  required
                />
                {dateError && <p className="text-sm text-destructive mt-1">{dateError}</p>}
              </div>

              <div>
                <Label htmlFor="performedBy">{t('form.performedBy.label')}</Label>
                <Input
                  id="performedBy"
                  placeholder={t('form.performedBy.placeholder')}
                  value={performedBy}
                  onChange={(e) => setPerformedBy(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="mt-4">
              <Label className="text-xs text-muted-foreground">Service Type</Label>
              <p className="text-sm font-medium mt-1">
                {serviceType === ServiceType.MAINTENANCE ? 'Maintenance' : 'Inspection'}
              </p>
            </div>
          </div>

          {/* Bearing Clearance Section */}
          {blueprintSections.includes('BEARING_CLEARANCE') && (
            <Collapsible open={bearingClearanceOpen} onOpenChange={setBearingClearanceOpen}>
              <CollapsibleTrigger className="w-full">
                <div className="border rounded-lg p-4 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <h3 className="text-base font-semibold">{t('form.bearingClearance.title')}</h3>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${bearingClearanceOpen ? 'transform rotate-180' : ''}`}
                  />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="border border-t-0 rounded-b-lg p-6 bg-white">
                  <Tabs defaultValue="outer" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="outer">{t('form.bearingClearance.outer')}</TabsTrigger>
                      <TabsTrigger value="inner">{t('form.bearingClearance.inner')}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="outer" className="space-y-6">
                      {/* Show before/after tabs only for maintenance with checkbox */}
                      {serviceType === ServiceType.MAINTENANCE && includeBeforeData ? (
                        <Tabs defaultValue="before" className="w-full">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="before">
                              {t('form.bearingClearance.before')}
                            </TabsTrigger>
                            <TabsTrigger value="after">
                              {t('form.bearingClearance.after')}
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="before" className="mt-4">
                            <BearingClearanceForm
                              title=""
                              data={outerBeforeData}
                              updateFn={updateOuterBeforeField}
                              errors={outerBeforeErrors}
                              handleBlur={handleBlurOuterBefore}
                            />
                          </TabsContent>

                          <TabsContent value="after" className="mt-4">
                            <BearingClearanceForm
                              title=""
                              data={outerAfterData}
                              updateFn={updateOuterAfterField}
                              errors={outerAfterErrors}
                              handleBlur={handleBlurOuterAfter}
                            />
                          </TabsContent>
                        </Tabs>
                      ) : (
                        /* For inspection or maintenance without before data, show only after */
                        <BearingClearanceForm
                          title=""
                          data={outerAfterData}
                          updateFn={updateOuterAfterField}
                          errors={outerAfterErrors}
                          handleBlur={handleBlurOuterAfter}
                        />
                      )}
                    </TabsContent>

                    <TabsContent value="inner" className="space-y-6">
                      {/* Show before/after tabs only for maintenance with checkbox */}
                      {serviceType === ServiceType.MAINTENANCE && includeBeforeData ? (
                        <Tabs defaultValue="before" className="w-full">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="before">
                              {t('form.bearingClearance.before')}
                            </TabsTrigger>
                            <TabsTrigger value="after">
                              {t('form.bearingClearance.after')}
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="before" className="mt-4">
                            <BearingClearanceForm
                              title=""
                              data={innerBeforeData}
                              updateFn={updateInnerBeforeField}
                              errors={innerBeforeErrors}
                              handleBlur={handleBlurInnerBefore}
                            />
                          </TabsContent>

                          <TabsContent value="after" className="mt-4">
                            <BearingClearanceForm
                              title=""
                              data={innerAfterData}
                              updateFn={updateInnerAfterField}
                              errors={innerAfterErrors}
                              handleBlur={handleBlurInnerAfter}
                            />
                          </TabsContent>
                        </Tabs>
                      ) : (
                        /* For inspection or maintenance without before data, show only after */
                        <BearingClearanceForm
                          title=""
                          data={innerAfterData}
                          updateFn={updateInnerAfterField}
                          errors={innerAfterErrors}
                          handleBlur={handleBlurInnerAfter}
                        />
                      )}
                    </TabsContent>
                  </Tabs>

                  {/* Shared fields outside tabs */}
                  <div className="space-y-6 mt-6 pt-6 border-t">
                    {/* Additional Fields */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hasBeenAdjusted"
                          checked={sharedBearingFields.hasBeenAdjusted}
                          onCheckedChange={(checked: boolean) =>
                            setSharedBearingFields((prev) => ({
                              ...prev,
                              hasBeenAdjusted: checked,
                            }))
                          }
                        />
                        <Label htmlFor="hasBeenAdjusted" className="cursor-pointer text-xs">
                          Has Been Adjusted
                        </Label>
                      </div>

                      <div>
                        <Label htmlFor="combinedWith" className="text-xs">
                          {t('form.bearingClearance.combined_with.label')}
                        </Label>
                        <Input
                          id="combinedWith"
                          value={sharedBearingFields.combinedWith}
                          onChange={(e) =>
                            setSharedBearingFields((prev) => ({
                              ...prev,
                              combinedWith: e.target.value,
                            }))
                          }
                          placeholder={t('form.bearingClearance.combined_with.placeholder')}
                          className="mt-1 text-sm"
                        />
                      </div>

                      <div>
                        <Label htmlFor="matingPart" className="text-xs">
                          {t('form.bearingClearance.mating_part.label')}
                        </Label>
                        <select
                          id="matingPart"
                          value={sharedBearingFields.matingPart}
                          onChange={(e) =>
                            setSharedBearingFields((prev) => ({
                              ...prev,
                              matingPart: e.target.value as MatingPartType,
                            }))
                          }
                          className="mt-1 w-full h-9 px-3 text-sm border border-gray-300 rounded-md bg-white"
                        >
                          <option value={MatingPartType.BUSHING}>
                            {t('form.bearingClearance.mating_part.bushing')}
                          </option>
                          <option value={MatingPartType.CONNECTION}>
                            {t('form.bearingClearance.mating_part.connection')}
                          </option>
                          <option value={MatingPartType.NUT_SCREW_SLEEVE}>
                            {t('form.bearingClearance.mating_part.nut_screw_sleeve')}
                          </option>
                        </select>
                      </div>
                    </div>

                    {/* Shutdown Adjustment Mechanism Section */}
                    <div className="space-y-4 pt-4 border-t">
                      <h5 className="text-sm font-semibold">Shutdown Adjustment Mechanism</h5>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="slideMotorMounts" className="text-xs">
                            Slide Motor/Mounts
                          </Label>
                          <Input
                            id="slideMotorMounts"
                            value={sharedBearingFields.slideMotorMounts}
                            onChange={(e) =>
                              setSharedBearingFields((prev) => ({
                                ...prev,
                                slideMotorMounts: e.target.value,
                              }))
                            }
                            placeholder="Enter status"
                            className="mt-1 text-sm"
                          />
                        </div>

                        <div>
                          <Label htmlFor="powerCordHoses" className="text-xs">
                            Power Cord/Hoses
                          </Label>
                          <Input
                            id="powerCordHoses"
                            value={sharedBearingFields.powerCordHoses}
                            onChange={(e) =>
                              setSharedBearingFields((prev) => ({
                                ...prev,
                                powerCordHoses: e.target.value,
                              }))
                            }
                            placeholder="Enter status"
                            className="mt-1 text-sm"
                          />
                        </div>

                        <div>
                          <Label htmlFor="chainsGearsSprockets" className="text-xs">
                            Chains & Gears/Sprockets
                          </Label>
                          <Input
                            id="chainsGearsSprockets"
                            value={sharedBearingFields.chainsGearsSprockets}
                            onChange={(e) =>
                              setSharedBearingFields((prev) => ({
                                ...prev,
                                chainsGearsSprockets: e.target.value,
                              }))
                            }
                            placeholder="Enter status"
                            className="mt-1 text-sm"
                          />
                        </div>

                        <div>
                          <Label htmlFor="lockingClamps" className="text-xs">
                            Locking Clamps
                          </Label>
                          <Input
                            id="lockingClamps"
                            value={sharedBearingFields.lockingClamps}
                            onChange={(e) =>
                              setSharedBearingFields((prev) => ({
                                ...prev,
                                lockingClamps: e.target.value,
                              }))
                            }
                            placeholder="Enter status"
                            className="mt-1 text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="bearingNotes" className="text-xs">
                          Notes
                        </Label>
                        <textarea
                          id="bearingNotes"
                          value={sharedBearingFields.notes}
                          onChange={(e) =>
                            setSharedBearingFields((prev) => ({ ...prev, notes: e.target.value }))
                          }
                          placeholder="Enter any additional notes..."
                          className="mt-1 text-sm w-full min-h-[60px] px-3 py-2 border border-gray-300 rounded-md"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Slide Section */}
          {blueprintSections.includes('SLIDE') && (
            <SlideSection
              ref={slideRef}
              isOpen={slideOpen}
              onOpenChange={setSlideOpen}
              serviceType={serviceType}
            />
          )}

          {/* Gibs Section */}
          {blueprintSections.includes('GIBS') && (
            <GibsSection ref={gibsRef} isOpen={gibsOpen} onOpenChange={setGibsOpen} />
          )}

          {/* Lubrication Hydraulics Section */}
          {blueprintSections.includes('LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER') && (
            <LubricationHydraulicsSection
              ref={lubricationRef}
              isOpen={lubricationOpen}
              onOpenChange={setLubricationOpen}
            />
          )}

          {/* Clutch Section */}
          {blueprintSections.includes('CLUTCH') && (
            <ClutchSection ref={clutchRef} isOpen={clutchOpen} onOpenChange={setClutchOpen} />
          )}

          {/* Counterbalance Cylinder Section */}
          {blueprintSections.includes('COUNTERBALANCE_CYLINDER_AIRBAG') && (
            <CounterbalanceCylinderSection
              ref={counterbalanceRef}
              isOpen={counterbalanceOpen}
              onOpenChange={setCounterbalanceOpen}
            />
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('form.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('form.submit.loading') : t('form.submit.idle')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
