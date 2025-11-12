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
  type GibsData,
  type LubricationHydraulicsData,
  type ClutchData,
  type CounterbalanceCylinderData,
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
};

const defaultGibsData: GibsData = {
  hasBeenAdjusted: false,
  point1: 0,
  point2: 0,
  point3: 0,
  point4: 0,
  point5: 0,
  point6: 0,
  point7: 0,
  point8: 0,
  point9: 0,
  point10: 0,
  point11: 0,
  point12: 0,
  point13: 0,
  point14: 0,
  point15: 0,
  point16: 0,
  leftTop: undefined,
  leftBottom: undefined,
  rightTop: undefined,
  rightBottom: undefined,
  frontTop: undefined,
  frontBottom: undefined,
  backTop: undefined,
  backBottom: undefined,
  usable: '',
};

const defaultLubricationHydraulicsData: LubricationHydraulicsData = {
  lubePSI: undefined,
  monitorflowPSI: undefined,
  hydPSI: undefined,
  pressSWPSI: undefined,
  otherGauges: '',
  changedOil: false,
  oilTemperatureF: undefined,
  oilMfgType: '',
  changedFilter: false,
};

const defaultClutchData: ClutchData = {
  clutchType: '',
  clutchLocation: '',
  brakeSpringBrake: undefined,
  brakeSpringClutch: undefined,
  brakeSpringStudBolt: '',
  brakeAnchorClearanceFB: undefined,
  brakeAnchorClearanceFTB: undefined,
  brakeAnchorClearanceRTB: undefined,
  brakeStoppingTime: undefined,
  brakeLining: '',
  brakeClearing: undefined,
  brakeClearanceTotal: undefined,
  brakeClearanceRear: undefined,
  flywheelStoppingTime: undefined,
  flywheelBearings: '',
  flywheelBrake: '',
  clutchEngagements: undefined,
  clutchLining: '',
  clutchSeals: '',
  gearBacklashBefore: undefined,
  gearBacklashAfter: undefined,
  crankEndplayBefore: undefined,
  crankEndplayAfter: undefined,
  airRegulatorPSI: undefined,
  airClutchTravel: undefined,
  airLineOilerSetting: '',
  hydClutchClearanceTotal: undefined,
  hydClutchClearanceRear: undefined,
  hydraulicPressurePSI: undefined,
  accumulatorPSI: undefined,
  rotaryUnion: '',
  splinesDriveRingDisc: '',
  adjustingNutLockSecure: '',
  separateBrakeSeals: '',
  flexDisc: '',
};

const defaultCounterbalanceCylinderData: CounterbalanceCylinderData = {
  counterbalanceType: '',
  airbagPistonSeals: '',
  airbagPistonSealsLeakLocation: '',
  regulator: '',
  gaugePSI: undefined,
  pneumaticsPlumbing: '',
  rodSeals: '',
  rodBushing: '',
  oilWick: '',
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

  const [outerBeforeErrors, setOuterBeforeErrors] = useState<Record<string, string>>({});
  const [outerAfterErrors, setOuterAfterErrors] = useState<Record<string, string>>({});
  const [innerBeforeErrors, setInnerBeforeErrors] = useState<Record<string, string>>({});
  const [innerAfterErrors, setInnerAfterErrors] = useState<Record<string, string>>({});
  const [dateError, setDateError] = useState<string>('');

  // Lubrication Hydraulics state
  const [lubricationHydraulicsData, setLubricationHydraulicsData] =
    useState<LubricationHydraulicsData>(defaultLubricationHydraulicsData);
  const [lubricationHydraulicsErrors, setLubricationHydraulicsErrors] = useState<
    Record<string, string>
  >({});

  // Clutch state
  const [clutchData, setClutchData] = useState<ClutchData>(defaultClutchData);
  const [clutchErrors, setClutchErrors] = useState<Record<string, string>>({});

  // Counterbalance Cylinder state
  const [counterbalanceCylinderData, setCounterbalanceCylinderData] =
    useState<CounterbalanceCylinderData>(defaultCounterbalanceCylinderData);
  const [counterbalanceCylinderErrors, setCounterbalanceCylinderErrors] = useState<
    Record<string, string>
  >({});

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setDate(initialDate || new Date().toISOString().split('T')[0]);
      setPerformedBy(initialPerformedBy || '');
      setTouchedSections(new Set());
      setOuterBeforeData(defaultBearingData);
      setOuterAfterData(defaultBearingData);
      setInnerBeforeData(defaultBearingData);
      setInnerAfterData(defaultBearingData);
      setOuterBeforeErrors({});
      setOuterAfterErrors({});
      setInnerBeforeErrors({});
      setInnerAfterErrors({});
      setGibsOuterBeforeData(defaultGibsData);
      setGibsOuterAfterData(defaultGibsData);
      setGibsInnerBeforeData(defaultGibsData);
      setGibsInnerAfterData(defaultGibsData);
      setGibsOuterBeforeErrors({});
      setGibsOuterAfterErrors({});
      setGibsInnerBeforeErrors({});
      setGibsInnerAfterErrors({});
      setLubricationHydraulicsData(defaultLubricationHydraulicsData);
      setLubricationHydraulicsErrors({});
      setClutchData(defaultClutchData);
      setClutchErrors({});
      setCounterbalanceCylinderData(defaultCounterbalanceCylinderData);
      setCounterbalanceCylinderErrors({});
      setDateError('');
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

        if (serviceType === ServiceType.MAINTENANCE) {
          // For maintenance: require all "before" sections
          if (!outerBeforeTouched || !innerBeforeTouched) {
            validationErrors.push(
              'Bearing Clearance: For maintenance inspections, you must fill all "Before" sections (Outer Before and Inner Before)',
            );
          } else {
            validationErrors.push(
              ...validateBearingClearanceData(outerBeforeData).map((e) => `Outer Before: ${e}`),
            );
            validationErrors.push(
              ...validateBearingClearanceData(innerBeforeData).map((e) => `Inner Before: ${e}`),
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

        // For routine inspection: require at least one "after" section
        if (serviceType === ServiceType.INSPECTION && !outerAfterTouched && !innerAfterTouched) {
          validationErrors.push(
            'Bearing Clearance: For routine inspections, you must fill at least one "After" section (Outer After or Inner After)',
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

        payload.bearingClearance = {
          outerBefore: outerBeforeTouched ? outerBeforeData : undefined,
          outerAfter: outerAfterTouched ? outerAfterData : undefined,
          innerBefore: innerBeforeTouched ? innerBeforeData : undefined,
          innerAfter: innerAfterTouched ? innerAfterData : undefined,
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
                    </TabsContent>

                    <TabsContent value="inner" className="space-y-6">
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
                    </TabsContent>
                  </Tabs>
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
