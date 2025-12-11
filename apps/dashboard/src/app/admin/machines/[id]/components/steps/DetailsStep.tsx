import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Typography } from '@/components/ui/typography';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Stepper, type StepperStep } from '@/components/ui/stepper';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import { ServiceType } from '@/data/types/services.types';
import { UnitSelector } from '@/components/ui/forms/UnitSelector';
import { TemperatureUnitSelector } from '@/components/ui/forms/TemperatureUnitSelector';
import { PressureUnitSelector } from '@/components/ui/forms/PressureUnitSelector';
import {
  YesNoNaDncType,
  YesNoDncType,
  DriveBeltConditionType,
  ProtectiveCoversStatusType,
} from '@titans-tech/shared/enums';
import { WhyNotCoveredType } from '@titans-tech/shared/types';
import { SECTION_REGISTRY } from '../sections/registry';

interface DetailsStepProps {
  date: Date;
  performedBy: string;
  setPerformedBy: (value: string) => void;
  selectedServiceType: ServiceType;
  setSelectedServiceType: (value: ServiceType) => void;
  selectedSections: Set<string>;
  error: string | null;
  isCompletingService: boolean;
  shouldSkipSelection: boolean;
  stepperSteps: StepperStep[];
  onStepClick: (index: number) => void;
  onBack: () => void;
  onNext: () => void;

  // Inspection observation fields
  isPressLevel?: YesNoNaDncType;
  setIsPressLevel: (value: YesNoNaDncType | undefined) => void;
  driveBeltCondition: DriveBeltConditionType | undefined;
  setDriveBeltCondition: (value: string) => void;
  areAllProtectiveCovers: ProtectiveCoversStatusType | undefined;
  setAreAllProtectiveCovers: (value: string) => void;
  protectiveCoversExplanation: string;
  setProtectiveCoversExplanation: (value: string) => void;
  areCracksVisible?: YesNoDncType;
  setAreCracksVisible: (value: YesNoDncType | undefined) => void;
  cracksLocation: string;
  setCracksLocation: (value: string) => void;
  isMainMotorSecure?: YesNoDncType;
  setIsMainMotorSecure: (value: YesNoDncType | undefined) => void;
  isMotorPlateSecure?: YesNoDncType;
  setIsMotorPlateSecure: (value: YesNoDncType | undefined) => void;
  whyNotCovered: WhyNotCoveredType | undefined;
  setWhyNotCovered: (value: string) => void;

  // Optional machine data (for read-only display)
  machine?: {
    manufacturer?: string;
    sizeTonnage?: string;
    serialNumber?: string;
    stroke?: string;
    foundationType?: string;
    frameType?: string;
    clutchType?: string;
    pneumaticSystem?: string;
    pressMounting?: string;
    features?: string;
  };

  translations: {
    dateLabel: string;
    performedByLabel: string;
    performedByPlaceholder: string;
    serviceTypeLabel: string;
    inspectionType: string;
    maintenanceType: string;
    selectedAreasTitle: string;
    getSectionName: (i18nKey: string) => string;
    back: string;
    continue: string;
    // Machine information
    machineInformationTitle: string;
    manufacturer: string;
    sizeTonnage: string;
    serialNumber: string;
    stroke: string;
    foundationType: string;
    frameType: string;
    clutchType: string;
    pneumaticSystem: string;
    pressMounting: string;
    features: string;
    // Inspection observations
    inspectionObservationsTitle: string;
    isPressLevel: string;
    driveBeltCondition: string;
    areAllProtectiveCovers: string;
    protectiveCoversExplanation: string;
    areCracksVisible: string;
    cracksLocation: string;
    isMainMotorSecure: string;
    isMotorPlateSecure: string;
    whyNotCovered: string;
  };
}

export function DetailsStep({
  date,
  performedBy,
  setPerformedBy,
  selectedServiceType,
  setSelectedServiceType,
  selectedSections,
  error,
  isCompletingService,
  shouldSkipSelection,
  stepperSteps,
  onStepClick,
  onBack,
  onNext,
  // Inspection fields
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
  machine,
  translations,
}: DetailsStepProps) {
  const tInspections = useTranslations('inspections.form.enums');

  return (
    <>
      {/* Stepper */}
      <div className="mt-2 px-4">
        <Stepper steps={stepperSteps} onStepClick={onStepClick} />
      </div>

      {/* Unit Selectors */}
      <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-4 px-4 py-4 border-b">
        <UnitSelector />
        <TemperatureUnitSelector />
        <PressureUnitSelector />
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-6 py-4">
        {/* Basic Service Info */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date">{translations.dateLabel}</Label>
            <div className="flex items-center gap-2 mt-1 h-10 px-3 py-2 border rounded-md">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{date ? format(date, 'PPP') : '-'}</span>
            </div>
          </div>

          {isCompletingService ? (
            <div>
              <Label htmlFor="performedBy">
                {translations.performedByLabel} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="performedBy"
                type="text"
                value={performedBy}
                onChange={(e) => setPerformedBy(e.target.value)}
                placeholder={translations.performedByPlaceholder}
                className="mt-1 h-10"
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="type">{translations.serviceTypeLabel}</Label>
              <Select
                value={selectedServiceType}
                onValueChange={(value) => setSelectedServiceType(value as ServiceType)}
              >
                <SelectTrigger id="type" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ServiceType.INSPECTION}>
                    {translations.inspectionType}
                  </SelectItem>
                  <SelectItem value={ServiceType.MAINTENANCE}>
                    {translations.maintenanceType}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Machine Information (Read-only) */}
        {machine && (
          <div className="border rounded-lg p-4 bg-muted/30">
            <Typography variant="h4" className="mb-3">
              {translations.machineInformationTitle}
            </Typography>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {machine.manufacturer && (
                <div>
                  <span className="text-muted-foreground">{translations.manufacturer}:</span>
                  <span className="ml-2 font-medium">{machine.manufacturer}</span>
                </div>
              )}
              {machine.sizeTonnage && (
                <div>
                  <span className="text-muted-foreground">{translations.sizeTonnage}:</span>
                  <span className="ml-2 font-medium">{machine.sizeTonnage}</span>
                </div>
              )}
              {machine.serialNumber && (
                <div>
                  <span className="text-muted-foreground">{translations.serialNumber}:</span>
                  <span className="ml-2 font-medium">{machine.serialNumber}</span>
                </div>
              )}
              {machine.stroke && (
                <div>
                  <span className="text-muted-foreground">{translations.stroke}:</span>
                  <span className="ml-2 font-medium">{machine.stroke}</span>
                </div>
              )}
              {machine.foundationType && (
                <div>
                  <span className="text-muted-foreground">{translations.foundationType}:</span>
                  <span className="ml-2 font-medium">{machine.foundationType}</span>
                </div>
              )}
              {machine.frameType && (
                <div>
                  <span className="text-muted-foreground">{translations.frameType}:</span>
                  <span className="ml-2 font-medium">{machine.frameType}</span>
                </div>
              )}
              {machine.clutchType && (
                <div>
                  <span className="text-muted-foreground">{translations.clutchType}:</span>
                  <span className="ml-2 font-medium">{machine.clutchType}</span>
                </div>
              )}
              {machine.pneumaticSystem && (
                <div>
                  <span className="text-muted-foreground">{translations.pneumaticSystem}:</span>
                  <span className="ml-2 font-medium">{machine.pneumaticSystem}</span>
                </div>
              )}
              {machine.pressMounting && (
                <div>
                  <span className="text-muted-foreground">{translations.pressMounting}:</span>
                  <span className="ml-2 font-medium">{machine.pressMounting}</span>
                </div>
              )}
              {machine.features && (
                <div>
                  <span className="text-muted-foreground">{translations.features}:</span>
                  <span className="ml-2 font-medium">{machine.features}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Inspection Observation Fields */}
        <div className="sm:border rounded-lg sm:p-4">
          <Typography variant="h4" className="mb-4">
            {translations.inspectionObservationsTitle}
          </Typography>

          <div className="space-y-4">
            {/* Press Level */}
            <div>
              <Label htmlFor="isPressLevel">
                {translations.isPressLevel} <span className="text-destructive">*</span>
              </Label>
              <Select
                value={isPressLevel || ''}
                onValueChange={(value) => setIsPressLevel(value as YesNoNaDncType)}
              >
                <SelectTrigger id="isPressLevel" className="mt-1">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={YesNoNaDncType.YES}>Yes</SelectItem>
                  <SelectItem value={YesNoNaDncType.NO}>No</SelectItem>
                  <SelectItem value={YesNoNaDncType.NA}>N/A</SelectItem>
                  <SelectItem value={YesNoNaDncType.DNC}>DNC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Drive Belt Condition */}
            <div>
              <Label htmlFor="driveBeltCondition">
                {translations.driveBeltCondition} <span className="text-destructive">*</span>
              </Label>
              <Select value={driveBeltCondition} onValueChange={setDriveBeltCondition}>
                <SelectTrigger id="driveBeltCondition" className="mt-1">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OK">OK</SelectItem>
                  <SelectItem value="NA">N/A</SelectItem>
                  <SelectItem value="LOOSENED">Loosened</SelectItem>
                  <SelectItem value="TIGHTENED">Tightened</SelectItem>
                  <SelectItem value="WORN">Worn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Protective Covers */}
            <div>
              <Label htmlFor="areAllProtectiveCovers">
                {translations.areAllProtectiveCovers} <span className="text-destructive">*</span>
              </Label>
              <Select value={areAllProtectiveCovers} onValueChange={setAreAllProtectiveCovers}>
                <SelectTrigger id="areAllProtectiveCovers" className="mt-1">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="YES">Yes</SelectItem>
                  <SelectItem value="NO">No</SelectItem>
                  <SelectItem value="OK">OK</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Conditional: Why Not Covered (appears when NO) */}
            {areAllProtectiveCovers === 'NO' && (
              <div>
                <Label htmlFor="whyNotCovered">{translations.whyNotCovered}</Label>
                <Select value={whyNotCovered} onValueChange={setWhyNotCovered}>
                  <SelectTrigger id="whyNotCovered" className="mt-1">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={WhyNotCoveredType.CUSTOMER_REMOVED}>
                      {tInspections('whyNotCovered.customerRemoved')}
                    </SelectItem>
                    <SelectItem value={WhyNotCoveredType.NOT_IN_AREA}>
                      {tInspections('whyNotCovered.notInArea')}
                    </SelectItem>
                    <SelectItem value={WhyNotCoveredType.OTHER_EXPLAIN}>
                      {tInspections('whyNotCovered.otherExplain')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Conditional: Protective Covers Explanation (appears when OTHER_EXPLAIN) */}
            {areAllProtectiveCovers === 'NO' &&
              whyNotCovered === WhyNotCoveredType.OTHER_EXPLAIN && (
                <div>
                  <Label htmlFor="protectiveCoversExplanation">
                    {translations.protectiveCoversExplanation}
                  </Label>
                  <Textarea
                    id="protectiveCoversExplanation"
                    value={protectiveCoversExplanation}
                    onChange={(e) => setProtectiveCoversExplanation(e.target.value)}
                    placeholder="Enter explanation..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
              )}

            {/* Cracks Visible */}
            <div>
              <Label htmlFor="areCracksVisible">
                {translations.areCracksVisible} <span className="text-destructive">*</span>
              </Label>
              <Select
                value={areCracksVisible || ''}
                onValueChange={(value) => setAreCracksVisible(value as YesNoDncType)}
              >
                <SelectTrigger id="areCracksVisible" className="mt-1">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={YesNoDncType.YES}>Yes</SelectItem>
                  <SelectItem value={YesNoDncType.NO}>No</SelectItem>
                  <SelectItem value={YesNoDncType.DNC}>DNC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Conditional: Cracks Location */}
            {areCracksVisible === YesNoDncType.YES && (
              <div>
                <Label htmlFor="cracksLocation">{translations.cracksLocation}</Label>
                <Input
                  id="cracksLocation"
                  value={cracksLocation}
                  onChange={(e) => setCracksLocation(e.target.value)}
                  placeholder="Enter location..."
                  className="mt-1"
                />
              </div>
            )}

            {/* Main Motor Secure */}
            <div>
              <Label htmlFor="isMainMotorSecure">
                {translations.isMainMotorSecure} <span className="text-destructive">*</span>
              </Label>
              <Select
                value={isMainMotorSecure || ''}
                onValueChange={(value) => setIsMainMotorSecure(value as YesNoDncType)}
              >
                <SelectTrigger id="isMainMotorSecure" className="mt-1">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={YesNoDncType.YES}>Yes</SelectItem>
                  <SelectItem value={YesNoDncType.NO}>No</SelectItem>
                  <SelectItem value={YesNoDncType.DNC}>DNC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Motor Plate Secure */}
            <div>
              <Label htmlFor="isMotorPlateSecure">
                {translations.isMotorPlateSecure} <span className="text-destructive">*</span>
              </Label>
              <Select
                value={isMotorPlateSecure || ''}
                onValueChange={(value) => setIsMotorPlateSecure(value as YesNoDncType)}
              >
                <SelectTrigger id="isMotorPlateSecure" className="mt-1">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={YesNoDncType.YES}>Yes</SelectItem>
                  <SelectItem value={YesNoDncType.NO}>No</SelectItem>
                  <SelectItem value={YesNoDncType.DNC}>DNC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Display selected sections summary */}
        <div className="sm:border rounded-lg sm:p-4">
          <Typography variant="h4" className="mb-3">
            {translations.selectedAreasTitle}
          </Typography>
          <div className="flex flex-wrap gap-2">
            {Array.from(selectedSections).map((sectionKey) => {
              const sectionConfig = SECTION_REGISTRY[sectionKey];
              if (!sectionConfig) return null;

              return (
                <div
                  key={sectionConfig.key}
                  className="px-3 py-1.5 bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 rounded-md text-sm"
                >
                  {translations.getSectionName(sectionConfig.metadata.i18nKey)}
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="text-sm text-destructive border border-destructive rounded-md p-2">
            {error}
          </div>
        )}
      </div>

      <div className="flex justify-between gap-3 pt-4 px-4 border-t">
        {!shouldSkipSelection && (
          <Button type="button" variant="outline" onClick={onBack}>
            {translations.back}
          </Button>
        )}
        <Button type="button" onClick={onNext} className={shouldSkipSelection ? 'ml-auto' : ''}>
          {translations.continue}
        </Button>
      </div>
    </>
  );
}
