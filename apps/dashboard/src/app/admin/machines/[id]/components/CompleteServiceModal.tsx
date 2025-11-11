'use client';

import { useState, useEffect } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { updateService } from '@/data/services/services.api';
import {
  ServiceType,
  ServiceStatus,
  MatingPartType,
  ParallelismType,
  type BearingClearanceData,
  type SlideData,
  type GibsData,
  type LubricationHydraulicsData,
  type ClutchData,
  type CounterbalanceCylinderData,
  type UpdateServicePayload,
  type ServiceCreationModalProps,
} from '@/data/types/services.types';
import { BearingClearanceForm } from './forms/BearingClearanceForm';
import { SlideForm } from './forms/SlideForm';
import { GibsForm } from './forms/GibsForm';
import { LubricationHydraulicsForm } from './forms/LubricationHydraulicsForm';
import { ClutchForm } from './forms/ClutchForm';
import { CounterbalanceCylinderForm } from './forms/CounterbalanceCylinderForm';

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

const defaultSlideData: SlideData = {
  parallelism: ParallelismType.DNC,
  hasBeenAdjusted: false,
  position1: 0,
  position2: 0,
  position3: 0,
  position4: 0,
  shutheightChecked: false,
  actualSH: '',
  overloadsOnMonitor: '',
  indicatorReading: '',
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
const isDataTouched = <T extends Record<string, any>>(data: T, defaultData: T): boolean => {
  return Object.keys(data).some((key) => {
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

const validateSlideData = (data: SlideData): string[] => {
  const errors: string[] = [];
  const requiredFields: (keyof SlideData)[] = ['position1', 'position2', 'position3', 'position4'];

  requiredFields.forEach((field) => {
    const value = data[field];
    if (typeof value !== 'number' || isNaN(value)) {
      errors.push(`${String(field)} is required and must be a valid number`);
    }
  });

  return errors;
};

const validateGibsData = (data: GibsData): string[] => {
  const errors: string[] = [];
  const requiredFields: (keyof GibsData)[] = [
    'point1',
    'point2',
    'point3',
    'point4',
    'point5',
    'point6',
    'point7',
    'point8',
    'point9',
    'point10',
    'point11',
    'point12',
    'point13',
    'point14',
    'point15',
    'point16',
  ];

  requiredFields.forEach((field) => {
    const value = data[field];
    if (typeof value !== 'number' || isNaN(value)) {
      errors.push(`${String(field)} is required and must be a valid number`);
    }
  });

  return errors;
};

const validateLubricationHydraulicsData = (_data: LubricationHydraulicsData): string[] => {
  // All fields are optional for this section
  return [];
};

const validateClutchData = (_data: ClutchData): string[] => {
  // All fields are optional for this section
  return [];
};

const validateCounterbalanceCylinderData = (_data: CounterbalanceCylinderData): string[] => {
  // All fields are optional for this section
  return [];
};

interface CompleteServiceModalProps extends ServiceCreationModalProps {
  serviceId: string; // ID of the service to complete
}

export function CompleteServiceModal({
  machineId,
  blueprintSections,
  serviceId,
  open,
  onOpenChange,
}: CompleteServiceModalProps) {
  console.log(blueprintSections);
  const t = useTranslations('inspections');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [serviceType, setServiceType] = useState<ServiceType>(ServiceType.INSPECTION);
  const [performedBy, setPerformedBy] = useState('');

  // Track which sections have been touched
  const [touchedSections, setTouchedSections] = useState<Set<string>>(new Set());

  // Collapsible section states
  const [bearingClearanceOpen, setBearingClearanceOpen] = useState(true);
  const [slideOpen, setSlideOpen] = useState(false);
  const [gibsOpen, setGibsOpen] = useState(false);
  const [lubricationOpen, setLubricationOpen] = useState(false);
  const [clutchOpen, setClutchOpen] = useState(false);
  const [counterbalanceOpen, setCounterbalanceOpen] = useState(false);

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

  // Slide state
  const [slideOuterBeforeData, setSlideOuterBeforeData] = useState<SlideData>(defaultSlideData);
  const [slideOuterAfterData, setSlideOuterAfterData] = useState<SlideData>(defaultSlideData);
  const [slideInnerBeforeData, setSlideInnerBeforeData] = useState<SlideData>(defaultSlideData);
  const [slideInnerAfterData, setSlideInnerAfterData] = useState<SlideData>(defaultSlideData);

  const [slideOuterBeforeErrors, setSlideOuterBeforeErrors] = useState<Record<string, string>>({});
  const [slideOuterAfterErrors, setSlideOuterAfterErrors] = useState<Record<string, string>>({});
  const [slideInnerBeforeErrors, setSlideInnerBeforeErrors] = useState<Record<string, string>>({});
  const [slideInnerAfterErrors, setSlideInnerAfterErrors] = useState<Record<string, string>>({});

  // Gibs state
  const [gibsOuterBeforeData, setGibsOuterBeforeData] = useState<GibsData>(defaultGibsData);
  const [gibsOuterAfterData, setGibsOuterAfterData] = useState<GibsData>(defaultGibsData);
  const [gibsInnerBeforeData, setGibsInnerBeforeData] = useState<GibsData>(defaultGibsData);
  const [gibsInnerAfterData, setGibsInnerAfterData] = useState<GibsData>(defaultGibsData);

  const [gibsOuterBeforeErrors, setGibsOuterBeforeErrors] = useState<Record<string, string>>({});
  const [gibsOuterAfterErrors, setGibsOuterAfterErrors] = useState<Record<string, string>>({});
  const [gibsInnerBeforeErrors, setGibsInnerBeforeErrors] = useState<Record<string, string>>({});
  const [gibsInnerAfterErrors, setGibsInnerAfterErrors] = useState<Record<string, string>>({});

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
      setDate(new Date().toISOString().split('T')[0]);
      setServiceType(ServiceType.INSPECTION);
      setPerformedBy('');
      setTouchedSections(new Set());
      setOuterBeforeData(defaultBearingData);
      setOuterAfterData(defaultBearingData);
      setInnerBeforeData(defaultBearingData);
      setInnerAfterData(defaultBearingData);
      setOuterBeforeErrors({});
      setOuterAfterErrors({});
      setInnerBeforeErrors({});
      setInnerAfterErrors({});
      setSlideOuterBeforeData(defaultSlideData);
      setSlideOuterAfterData(defaultSlideData);
      setSlideInnerBeforeData(defaultSlideData);
      setSlideInnerAfterData(defaultSlideData);
      setSlideOuterBeforeErrors({});
      setSlideOuterAfterErrors({});
      setSlideInnerBeforeErrors({});
      setSlideInnerAfterErrors({});
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
  }, [open]);

  // Mark section as touched when user interacts with it
  const markSectionTouched = (section: string) => {
    setTouchedSections((prev) => new Set(prev).add(section));
  };

  // Update functions with touch tracking
  const updateOuterBeforeField = (
    field: keyof BearingClearanceData,
    value: string | number | boolean,
  ) => {
    setOuterBeforeData((prev: BearingClearanceData) => ({ ...prev, [field]: value }));
    setOuterBeforeErrors((prev: Record<string, string>) => ({ ...prev, [field]: '' }));
    markSectionTouched('BEARING_CLEARANCE');
  };

  const updateOuterAfterField = (
    field: keyof BearingClearanceData,
    value: string | number | boolean,
  ) => {
    setOuterAfterData((prev: any) => ({ ...prev, [field]: value }));
    setOuterAfterErrors((prev: any) => ({ ...prev, [field]: '' }));
    markSectionTouched('BEARING_CLEARANCE');
  };

  const updateInnerBeforeField = (
    field: keyof BearingClearanceData,
    value: string | number | boolean,
  ) => {
    setInnerBeforeData((prev: any) => ({ ...prev, [field]: value }));
    setInnerBeforeErrors((prev: any) => ({ ...prev, [field]: '' }));
    markSectionTouched('BEARING_CLEARANCE');
  };

  const updateInnerAfterField = (
    field: keyof BearingClearanceData,
    value: string | number | boolean,
  ) => {
    setInnerAfterData((prev: any) => ({ ...prev, [field]: value }));
    setInnerAfterErrors((prev: any) => ({ ...prev, [field]: '' }));
    markSectionTouched('BEARING_CLEARANCE');
  };

  const updateSlideOuterBeforeField = (
    field: keyof SlideData,
    value: string | number | boolean,
  ) => {
    setSlideOuterBeforeData((prev: any) => ({ ...prev, [field]: value }));
    setSlideOuterBeforeErrors((prev: any) => ({ ...prev, [field]: '' }));
    markSectionTouched('SLIDE');
  };

  const updateSlideOuterAfterField = (field: keyof SlideData, value: string | number | boolean) => {
    setSlideOuterAfterData((prev: any) => ({ ...prev, [field]: value }));
    setSlideOuterAfterErrors((prev: any) => ({ ...prev, [field]: '' }));
    markSectionTouched('SLIDE');
  };

  const updateSlideInnerBeforeField = (
    field: keyof SlideData,
    value: string | number | boolean,
  ) => {
    setSlideInnerBeforeData((prev: any) => ({ ...prev, [field]: value }));
    setSlideInnerBeforeErrors((prev: any) => ({ ...prev, [field]: '' }));
    markSectionTouched('SLIDE');
  };

  const updateSlideInnerAfterField = (field: keyof SlideData, value: string | number | boolean) => {
    setSlideInnerAfterData((prev: any) => ({ ...prev, [field]: value }));
    setSlideInnerAfterErrors((prev: any) => ({ ...prev, [field]: '' }));
    markSectionTouched('SLIDE');
  };

  const updateGibsOuterBeforeField = (
    field: keyof GibsData,
    value: string | number | boolean | undefined,
  ) => {
    setGibsOuterBeforeData((prev: any) => ({ ...prev, [field]: value }));
    setGibsOuterBeforeErrors((prev: any) => ({ ...prev, [field]: '' }));
    markSectionTouched('GIBS');
  };

  const updateGibsOuterAfterField = (
    field: keyof GibsData,
    value: string | number | boolean | undefined,
  ) => {
    setGibsOuterAfterData((prev: any) => ({ ...prev, [field]: value }));
    setGibsOuterAfterErrors((prev: any) => ({ ...prev, [field]: '' }));
    markSectionTouched('GIBS');
  };

  const updateGibsInnerBeforeField = (
    field: keyof GibsData,
    value: string | number | boolean | undefined,
  ) => {
    setGibsInnerBeforeData((prev: any) => ({ ...prev, [field]: value }));
    setGibsInnerBeforeErrors((prev: any) => ({ ...prev, [field]: '' }));
    markSectionTouched('GIBS');
  };

  const updateGibsInnerAfterField = (
    field: keyof GibsData,
    value: string | number | boolean | undefined,
  ) => {
    setGibsInnerAfterData((prev: any) => ({ ...prev, [field]: value }));
    setGibsInnerAfterErrors((prev: any) => ({ ...prev, [field]: '' }));
    markSectionTouched('GIBS');
  };

  const updateLubricationHydraulicsField = (
    field: keyof LubricationHydraulicsData,
    value: string | number | boolean | undefined,
  ) => {
    setLubricationHydraulicsData((prev: any) => ({ ...prev, [field]: value }));
    setLubricationHydraulicsErrors((prev: any) => ({ ...prev, [field]: '' }));
    markSectionTouched('LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER');
  };

  const updateClutchField = (field: keyof ClutchData, value: string | number | undefined) => {
    setClutchData((prev: any) => ({ ...prev, [field]: value }));
    setClutchErrors((prev: any) => ({ ...prev, [field]: '' }));
    markSectionTouched('CLUTCH');
  };

  const updateCounterbalanceCylinderField = (
    field: keyof CounterbalanceCylinderData,
    value: string | number | undefined,
  ) => {
    setCounterbalanceCylinderData((prev: any) => ({ ...prev, [field]: value }));
    setCounterbalanceCylinderErrors((prev: any) => ({ ...prev, [field]: '' }));
    markSectionTouched('COUNTERBALANCE_CYLINDER_AIRBAG');
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

  const validateSlideField = (
    field: keyof SlideData,
    value: string | number | boolean | undefined,
  ): string => {
    if (
      field === 'hasBeenAdjusted' ||
      field === 'shutheightChecked' ||
      field === 'parallelism' ||
      field === 'actualSH' ||
      field === 'overloadsOnMonitor' ||
      field === 'indicatorReading'
    ) {
      return '';
    }

    const numValue = Number(value);
    if (isNaN(numValue)) {
      return t('form.error.invalidNumber');
    }

    return '';
  };

  const validateGibsField = (
    field: keyof GibsData,
    value: string | number | boolean | undefined,
  ): string => {
    if (field === 'hasBeenAdjusted' || field === 'usable') {
      return '';
    }

    // Optional directional measurements
    if (
      [
        'leftTop',
        'leftBottom',
        'rightTop',
        'rightBottom',
        'frontTop',
        'frontBottom',
        'backTop',
        'backBottom',
      ].includes(String(field))
    ) {
      if (value === undefined || value === '') return '';
    }

    const numValue = Number(value);
    if (isNaN(numValue)) {
      return t('form.error.invalidNumber');
    }

    return '';
  };

  const validateLubricationHydraulicsField = (
    _field: keyof LubricationHydraulicsData,
    _value: string | number | boolean | undefined,
  ): string => {
    return ''; // All fields optional
  };

  const validateClutchField = (
    _field: keyof ClutchData,
    _value: string | number | undefined,
  ): string => {
    return ''; // All fields optional
  };

  const validateCounterbalanceCylinderField = (
    _field: keyof CounterbalanceCylinderData,
    _value: string | number | undefined,
  ): string => {
    return ''; // All fields optional
  };

  // Blur handlers
  const handleBlurOuterBefore = (field: keyof BearingClearanceData) => {
    const error = validateField(field, outerBeforeData[field]);
    setOuterBeforeErrors((prev: any) => ({ ...prev, [field]: error }));
  };

  const handleBlurOuterAfter = (field: keyof BearingClearanceData) => {
    const error = validateField(field, outerAfterData[field]);
    setOuterAfterErrors((prev: any) => ({ ...prev, [field]: error }));
  };

  const handleBlurInnerBefore = (field: keyof BearingClearanceData) => {
    const error = validateField(field, innerBeforeData[field]);
    setInnerBeforeErrors((prev: any) => ({ ...prev, [field]: error }));
  };

  const handleBlurInnerAfter = (field: keyof BearingClearanceData) => {
    const error = validateField(field, innerAfterData[field]);
    setInnerAfterErrors((prev: any) => ({ ...prev, [field]: error }));
  };

  const handleBlurSlideOuterBefore = (field: keyof SlideData) => {
    const error = validateSlideField(field, slideOuterBeforeData[field]);
    setSlideOuterBeforeErrors((prev: any) => ({ ...prev, [field]: error }));
  };

  const handleBlurSlideOuterAfter = (field: keyof SlideData) => {
    const error = validateSlideField(field, slideOuterAfterData[field]);
    setSlideOuterAfterErrors((prev: any) => ({ ...prev, [field]: error }));
  };

  const handleBlurSlideInnerBefore = (field: keyof SlideData) => {
    const error = validateSlideField(field, slideInnerBeforeData[field]);
    setSlideInnerBeforeErrors((prev: any) => ({ ...prev, [field]: error }));
  };

  const handleBlurSlideInnerAfter = (field: keyof SlideData) => {
    const error = validateSlideField(field, slideInnerAfterData[field]);
    setSlideInnerAfterErrors((prev: any) => ({ ...prev, [field]: error }));
  };

  const handleBlurGibsOuterBefore = (field: keyof GibsData) => {
    const error = validateGibsField(field, gibsOuterBeforeData[field]);
    setGibsOuterBeforeErrors((prev: any) => ({ ...prev, [field]: error }));
  };

  const handleBlurGibsOuterAfter = (field: keyof GibsData) => {
    const error = validateGibsField(field, gibsOuterAfterData[field]);
    setGibsOuterAfterErrors((prev: any) => ({ ...prev, [field]: error }));
  };

  const handleBlurGibsInnerBefore = (field: keyof GibsData) => {
    const error = validateGibsField(field, gibsInnerBeforeData[field]);
    setGibsInnerBeforeErrors((prev: any) => ({ ...prev, [field]: error }));
  };

  const handleBlurGibsInnerAfter = (field: keyof GibsData) => {
    const error = validateGibsField(field, gibsInnerAfterData[field]);
    setGibsInnerAfterErrors((prev: any) => ({ ...prev, [field]: error }));
  };

  const handleBlurLubricationHydraulics = (field: keyof LubricationHydraulicsData) => {
    const error = validateLubricationHydraulicsField(field, lubricationHydraulicsData[field]);
    setLubricationHydraulicsErrors((prev: any) => ({ ...prev, [field]: error }));
  };

  const handleBlurClutch = (field: keyof ClutchData) => {
    const error = validateClutchField(field, clutchData[field]);
    setClutchErrors((prev: any) => ({ ...prev, [field]: error }));
  };

  const handleBlurCounterbalanceCylinder = (field: keyof CounterbalanceCylinderData) => {
    const error = validateCounterbalanceCylinderField(field, counterbalanceCylinderData[field]);
    setCounterbalanceCylinderErrors((prev: any) => ({ ...prev, [field]: error }));
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

      if (touchedSections.has('SLIDE') && blueprintSections.includes('SLIDE')) {
        const outerBeforeTouched = isDataTouched(slideOuterBeforeData, defaultSlideData);
        const outerAfterTouched = isDataTouched(slideOuterAfterData, defaultSlideData);
        const innerBeforeTouched = isDataTouched(slideInnerBeforeData, defaultSlideData);
        const innerAfterTouched = isDataTouched(slideInnerAfterData, defaultSlideData);

        if (serviceType === ServiceType.MAINTENANCE) {
          if (!outerBeforeTouched || !innerBeforeTouched) {
            validationErrors.push(
              'Slide: For maintenance inspections, you must fill all "Before" sections (Outer Before and Inner Before)',
            );
          } else {
            validationErrors.push(
              ...validateSlideData(slideOuterBeforeData).map((e) => `Slide Outer Before: ${e}`),
            );
            validationErrors.push(
              ...validateSlideData(slideInnerBeforeData).map((e) => `Slide Inner Before: ${e}`),
            );
          }
        }

        if (outerAfterTouched) {
          validationErrors.push(
            ...validateSlideData(slideOuterAfterData).map((e) => `Slide Outer After: ${e}`),
          );
        }
        if (innerAfterTouched) {
          validationErrors.push(
            ...validateSlideData(slideInnerAfterData).map((e) => `Slide Inner After: ${e}`),
          );
        }

        if (serviceType === ServiceType.INSPECTION && !outerAfterTouched && !innerAfterTouched) {
          validationErrors.push(
            'Slide: For routine inspections, you must fill at least one "After" section (Outer After or Inner After)',
          );
        }
      }

      if (touchedSections.has('GIBS') && blueprintSections.includes('GIBS')) {
        const outerBeforeTouched = isDataTouched(gibsOuterBeforeData, defaultGibsData);
        const outerAfterTouched = isDataTouched(gibsOuterAfterData, defaultGibsData);
        const innerBeforeTouched = isDataTouched(gibsInnerBeforeData, defaultGibsData);
        const innerAfterTouched = isDataTouched(gibsInnerAfterData, defaultGibsData);

        if (serviceType === ServiceType.MAINTENANCE) {
          if (!outerBeforeTouched || !innerBeforeTouched) {
            validationErrors.push(
              'Gibs: For maintenance inspections, you must fill all "Before" sections (Outer Before and Inner Before)',
            );
          } else {
            validationErrors.push(
              ...validateGibsData(gibsOuterBeforeData).map((e) => `Gibs Outer Before: ${e}`),
            );
            validationErrors.push(
              ...validateGibsData(gibsInnerBeforeData).map((e) => `Gibs Inner Before: ${e}`),
            );
          }
        }

        if (outerAfterTouched) {
          validationErrors.push(
            ...validateGibsData(gibsOuterAfterData).map((e) => `Gibs Outer After: ${e}`),
          );
        }
        if (innerAfterTouched) {
          validationErrors.push(
            ...validateGibsData(gibsInnerAfterData).map((e) => `Gibs Inner After: ${e}`),
          );
        }

        if (serviceType === ServiceType.INSPECTION && !outerAfterTouched && !innerAfterTouched) {
          validationErrors.push(
            'Gibs: For routine inspections, you must fill at least one "After" section (Outer After or Inner After)',
          );
        }
      }

      // Single-form sections (Lubrication, Clutch, Counterbalance)
      if (
        touchedSections.has('LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER') &&
        blueprintSections.includes('LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER')
      ) {
        const touched = isDataTouched(lubricationHydraulicsData, defaultLubricationHydraulicsData);
        if (touched) {
          validationErrors.push(...validateLubricationHydraulicsData(lubricationHydraulicsData));
        }
      }

      if (touchedSections.has('CLUTCH') && blueprintSections.includes('CLUTCH')) {
        const touched = isDataTouched(clutchData, defaultClutchData);
        if (touched) {
          validationErrors.push(...validateClutchData(clutchData));
        }
      }

      if (
        touchedSections.has('COUNTERBALANCE_CYLINDER_AIRBAG') &&
        blueprintSections.includes('COUNTERBALANCE_CYLINDER_AIRBAG')
      ) {
        const touched = isDataTouched(
          counterbalanceCylinderData,
          defaultCounterbalanceCylinderData,
        );
        if (touched) {
          validationErrors.push(...validateCounterbalanceCylinderData(counterbalanceCylinderData));
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
      if (touchedSections.has('SLIDE') && blueprintSections.includes('SLIDE')) {
        const outerBeforeTouched = isDataTouched(slideOuterBeforeData, defaultSlideData);
        const outerAfterTouched = isDataTouched(slideOuterAfterData, defaultSlideData);
        const innerBeforeTouched = isDataTouched(slideInnerBeforeData, defaultSlideData);
        const innerAfterTouched = isDataTouched(slideInnerAfterData, defaultSlideData);

        payload.slide = {
          outerBefore: outerBeforeTouched ? slideOuterBeforeData : undefined,
          outerAfter: outerAfterTouched ? slideOuterAfterData : undefined,
          innerBefore: innerBeforeTouched ? slideInnerBeforeData : undefined,
          innerAfter: innerAfterTouched ? slideInnerAfterData : undefined,
        };
      }

      // Only add gibs if section was touched
      if (touchedSections.has('GIBS') && blueprintSections.includes('GIBS')) {
        const outerBeforeTouched = isDataTouched(gibsOuterBeforeData, defaultGibsData);
        const outerAfterTouched = isDataTouched(gibsOuterAfterData, defaultGibsData);
        const innerBeforeTouched = isDataTouched(gibsInnerBeforeData, defaultGibsData);
        const innerAfterTouched = isDataTouched(gibsInnerAfterData, defaultGibsData);

        payload.gibs = {
          outerBefore: outerBeforeTouched ? gibsOuterBeforeData : undefined,
          outerAfter: outerAfterTouched ? gibsOuterAfterData : undefined,
          innerBefore: innerBeforeTouched ? gibsInnerBeforeData : undefined,
          innerAfter: innerAfterTouched ? gibsInnerAfterData : undefined,
        };
      }

      // Only add lubrication hydraulics if section was touched
      if (
        touchedSections.has('LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER') &&
        blueprintSections.includes('LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER')
      ) {
        const touched = isDataTouched(lubricationHydraulicsData, defaultLubricationHydraulicsData);
        if (touched) {
          payload.lubricationHydraulics = lubricationHydraulicsData;
        }
      }

      // Only add clutch if section was touched
      if (touchedSections.has('CLUTCH') && blueprintSections.includes('CLUTCH')) {
        const touched = isDataTouched(clutchData, defaultClutchData);
        if (touched) {
          payload.clutch = clutchData;
        }
      }

      // Only add counterbalance cylinder if section was touched
      if (
        touchedSections.has('COUNTERBALANCE_CYLINDER_AIRBAG') &&
        blueprintSections.includes('COUNTERBALANCE_CYLINDER_AIRBAG')
      ) {
        const touched = isDataTouched(
          counterbalanceCylinderData,
          defaultCounterbalanceCylinderData,
        );
        if (touched) {
          payload.counterbalanceCylinder = counterbalanceCylinderData;
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

            <div className="flex items-center space-x-2 mt-4">
              <Checkbox
                id="serviceType"
                checked={serviceType === ServiceType.MAINTENANCE}
                onCheckedChange={(checked: boolean) =>
                  setServiceType(checked ? ServiceType.MAINTENANCE : ServiceType.INSPECTION)
                }
              />
              <Label htmlFor="serviceType" className="cursor-pointer">
                {t('form.isMaintenance.label')}
              </Label>
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
            <Collapsible open={slideOpen} onOpenChange={setSlideOpen}>
              <CollapsibleTrigger className="w-full">
                <div className="border rounded-lg p-4 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <h3 className="text-base font-semibold">Slide</h3>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${slideOpen ? 'transform rotate-180' : ''}`}
                  />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="border border-t-0 rounded-b-lg p-6 bg-white">
                  <Tabs defaultValue="outer" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="outer">Outer Measurements</TabsTrigger>
                      <TabsTrigger value="inner">Inner Measurements</TabsTrigger>
                    </TabsList>

                    <TabsContent value="outer" className="space-y-6">
                      <Tabs defaultValue="before" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="before">Before Maintenance</TabsTrigger>
                          <TabsTrigger value="after">After Maintenance</TabsTrigger>
                        </TabsList>

                        <TabsContent value="before" className="mt-4">
                          <SlideForm
                            data={slideOuterBeforeData}
                            updateFn={updateSlideOuterBeforeField}
                            errors={slideOuterBeforeErrors}
                            handleBlur={handleBlurSlideOuterBefore}
                            title="Outer Before"
                          />
                        </TabsContent>

                        <TabsContent value="after" className="mt-4">
                          <SlideForm
                            data={slideOuterAfterData}
                            updateFn={updateSlideOuterAfterField}
                            errors={slideOuterAfterErrors}
                            handleBlur={handleBlurSlideOuterAfter}
                            title="Outer After"
                          />
                        </TabsContent>
                      </Tabs>
                    </TabsContent>

                    <TabsContent value="inner" className="space-y-6">
                      <Tabs defaultValue="before" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="before">Before Maintenance</TabsTrigger>
                          <TabsTrigger value="after">After Maintenance</TabsTrigger>
                        </TabsList>

                        <TabsContent value="before" className="mt-4">
                          <SlideForm
                            data={slideInnerBeforeData}
                            updateFn={updateSlideInnerBeforeField}
                            errors={slideInnerBeforeErrors}
                            handleBlur={handleBlurSlideInnerBefore}
                            title="Inner Before"
                          />
                        </TabsContent>

                        <TabsContent value="after" className="mt-4">
                          <SlideForm
                            data={slideInnerAfterData}
                            updateFn={updateSlideInnerAfterField}
                            errors={slideInnerAfterErrors}
                            handleBlur={handleBlurSlideInnerAfter}
                            title="Inner After"
                          />
                        </TabsContent>
                      </Tabs>
                    </TabsContent>
                  </Tabs>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Gibs Section */}
          {blueprintSections.includes('GIBS') && (
            <Collapsible open={gibsOpen} onOpenChange={setGibsOpen}>
              <CollapsibleTrigger className="w-full">
                <div className="border rounded-lg p-4 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <h3 className="text-base font-semibold">Gibs</h3>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${gibsOpen ? 'transform rotate-180' : ''}`}
                  />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="border border-t-0 rounded-b-lg p-6 bg-white">
                  <Tabs defaultValue="outer" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="outer">Outer Measurements</TabsTrigger>
                      <TabsTrigger value="inner">Inner Measurements</TabsTrigger>
                    </TabsList>

                    <TabsContent value="outer" className="space-y-6">
                      <Tabs defaultValue="before" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="before">Before Maintenance</TabsTrigger>
                          <TabsTrigger value="after">After Maintenance</TabsTrigger>
                        </TabsList>

                        <TabsContent value="before" className="mt-4">
                          <GibsForm
                            data={gibsOuterBeforeData}
                            updateFn={updateGibsOuterBeforeField}
                            errors={gibsOuterBeforeErrors}
                            handleBlur={handleBlurGibsOuterBefore}
                            title="Outer Before"
                          />
                        </TabsContent>

                        <TabsContent value="after" className="mt-4">
                          <GibsForm
                            data={gibsOuterAfterData}
                            updateFn={updateGibsOuterAfterField}
                            errors={gibsOuterAfterErrors}
                            handleBlur={handleBlurGibsOuterAfter}
                            title="Outer After"
                          />
                        </TabsContent>
                      </Tabs>
                    </TabsContent>

                    <TabsContent value="inner" className="space-y-6">
                      <Tabs defaultValue="before" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="before">Before Maintenance</TabsTrigger>
                          <TabsTrigger value="after">After Maintenance</TabsTrigger>
                        </TabsList>

                        <TabsContent value="before" className="mt-4">
                          <GibsForm
                            data={gibsInnerBeforeData}
                            updateFn={updateGibsInnerBeforeField}
                            errors={gibsInnerBeforeErrors}
                            handleBlur={handleBlurGibsInnerBefore}
                            title="Inner Before"
                          />
                        </TabsContent>

                        <TabsContent value="after" className="mt-4">
                          <GibsForm
                            data={gibsInnerAfterData}
                            updateFn={updateGibsInnerAfterField}
                            errors={gibsInnerAfterErrors}
                            handleBlur={handleBlurGibsInnerAfter}
                            title="Inner After"
                          />
                        </TabsContent>
                      </Tabs>
                    </TabsContent>
                  </Tabs>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Lubrication Hydraulics Section */}
          {blueprintSections.includes('LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER') && (
            <Collapsible open={lubricationOpen} onOpenChange={setLubricationOpen}>
              <CollapsibleTrigger className="w-full">
                <div className="border rounded-lg p-4 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <h3 className="text-base font-semibold">
                    Lubrication / Hydraulics / Pressure Switches / Oil & Filter
                  </h3>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${lubricationOpen ? 'transform rotate-180' : ''}`}
                  />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="border border-t-0 rounded-b-lg p-6 bg-white">
                  <LubricationHydraulicsForm
                    data={lubricationHydraulicsData}
                    updateFn={updateLubricationHydraulicsField}
                    errors={lubricationHydraulicsErrors}
                    handleBlur={handleBlurLubricationHydraulics}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Clutch Section */}
          {blueprintSections.includes('CLUTCH') && (
            <Collapsible open={clutchOpen} onOpenChange={setClutchOpen}>
              <CollapsibleTrigger className="w-full">
                <div className="border rounded-lg p-4 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <h3 className="text-base font-semibold">Clutch</h3>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${clutchOpen ? 'transform rotate-180' : ''}`}
                  />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="border border-t-0 rounded-b-lg p-6 bg-white">
                  <ClutchForm
                    data={clutchData}
                    updateFn={updateClutchField}
                    errors={clutchErrors}
                    handleBlur={handleBlurClutch}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Counterbalance Cylinder Section */}
          {blueprintSections.includes('COUNTERBALANCE_CYLINDER_AIRBAG') && (
            <Collapsible open={counterbalanceOpen} onOpenChange={setCounterbalanceOpen}>
              <CollapsibleTrigger className="w-full">
                <div className="border rounded-lg p-4 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <h3 className="text-base font-semibold">Counterbalance Cylinder / Airbag</h3>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${counterbalanceOpen ? 'transform rotate-180' : ''}`}
                  />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="border border-t-0 rounded-b-lg p-6 bg-white">
                  <Tabs defaultValue="outer" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="outer">Outer Data</TabsTrigger>
                      <TabsTrigger value="inner">Inner Data</TabsTrigger>
                    </TabsList>

                    <TabsContent value="outer" className="space-y-6">
                      <CounterbalanceCylinderForm
                        data={counterbalanceCylinderData}
                        updateFn={updateCounterbalanceCylinderField}
                        errors={counterbalanceCylinderErrors}
                        handleBlur={handleBlurCounterbalanceCylinder}
                        title="Outer"
                      />
                    </TabsContent>

                    <TabsContent value="inner" className="space-y-6">
                      <CounterbalanceCylinderForm
                        data={counterbalanceCylinderData}
                        updateFn={updateCounterbalanceCylinderField}
                        errors={counterbalanceCylinderErrors}
                        handleBlur={handleBlurCounterbalanceCylinder}
                        title="Inner"
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              </CollapsibleContent>
            </Collapsible>
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
