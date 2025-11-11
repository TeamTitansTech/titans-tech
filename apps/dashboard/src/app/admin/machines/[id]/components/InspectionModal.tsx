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
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { createService } from '@/data/services/services.api';
import {
  ServiceType,
  type CreateServicePayload,
  type InspectionModalProps,
} from '@/data/types/services.types';
import {
  BearingClearanceSection,
  type BearingClearanceSectionRef,
} from './sections/BearingClearanceSection';
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

export default function InspectionModal({
  machineId,
  blueprintSections,
  open,
  onOpenChange,
}: InspectionModalProps) {
  console.log(blueprintSections);
  const t = useTranslations('inspections');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [serviceType, setServiceType] = useState<ServiceType>(ServiceType.INSPECTION);
  const [performedBy, setPerformedBy] = useState('');
  const [dateError, setDateError] = useState<string>('');

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
  const bearingClearanceRef = useRef<BearingClearanceSectionRef>(null);
  const slideRef = useRef<SlideSectionRef>(null);
  const gibsRef = useRef<GibsSectionRef>(null);
  const lubricationHydraulicsRef = useRef<LubricationHydraulicsSectionRef>(null);
  const clutchRef = useRef<ClutchSectionRef>(null);
  const counterbalanceCylinderRef = useRef<CounterbalanceCylinderSectionRef>(null);

  // Mark section as touched when user interacts with it
  const markSectionTouched = (section: string) => {
    setTouchedSections((prev) => new Set(prev).add(section));
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setDate(new Date().toISOString().split('T')[0]);
      setServiceType(ServiceType.INSPECTION);
      setPerformedBy('');
      setTouchedSections(new Set());
      setDateError('');

      // Reset all sections
      bearingClearanceRef.current?.reset();
      slideRef.current?.reset();
      gibsRef.current?.reset();
      lubricationHydraulicsRef.current?.reset();
      clutchRef.current?.reset();
      counterbalanceCylinderRef.current?.reset();
    }
  }, [open]);

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

      // Validate each touched section
      if (
        touchedSections.has('BEARING_CLEARANCE') &&
        blueprintSections.includes('BEARING_CLEARANCE')
      ) {
        const errors = bearingClearanceRef.current?.validate(serviceType) || [];
        validationErrors.push(...errors);
      }

      if (touchedSections.has('SLIDE') && blueprintSections.includes('SLIDE')) {
        const errors = slideRef.current?.validate(serviceType) || [];
        validationErrors.push(...errors);
      }

      if (touchedSections.has('GIBS') && blueprintSections.includes('GIBS')) {
        const errors = gibsRef.current?.validate(serviceType) || [];
        validationErrors.push(...errors);
      }

      if (
        touchedSections.has('LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER') &&
        blueprintSections.includes('LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER')
      ) {
        const errors = lubricationHydraulicsRef.current?.validate(serviceType) || [];
        validationErrors.push(...errors);
      }

      if (touchedSections.has('CLUTCH') && blueprintSections.includes('CLUTCH')) {
        const errors = clutchRef.current?.validate(serviceType) || [];
        validationErrors.push(...errors);
      }

      if (
        touchedSections.has('COUNTERBALANCE_CYLINDER_AIRBAG') &&
        blueprintSections.includes('COUNTERBALANCE_CYLINDER_AIRBAG')
      ) {
        const errors = counterbalanceCylinderRef.current?.validate(serviceType) || [];
        validationErrors.push(...errors);
      }

      if (validationErrors.length > 0) {
        toast.error(validationErrors.join('\n\n'));
        setIsSubmitting(false);
        return;
      }

      // Build payload - only include touched sections
      const payload: CreateServicePayload = {
        machineId,
        date: new Date(date).toISOString(),
        type: serviceType,
        performedBy: performedBy || undefined,
      };

      // Get data from each section
      if (
        touchedSections.has('BEARING_CLEARANCE') &&
        blueprintSections.includes('BEARING_CLEARANCE')
      ) {
        const data = bearingClearanceRef.current?.getData();
        if (data) {
          payload.bearingClearance = data;
        }
      }

      if (touchedSections.has('SLIDE') && blueprintSections.includes('SLIDE')) {
        const data = slideRef.current?.getData();
        if (data) {
          payload.slide = data;
        }
      }

      if (touchedSections.has('GIBS') && blueprintSections.includes('GIBS')) {
        const data = gibsRef.current?.getData();
        if (data) {
          payload.gibs = data;
        }
      }

      if (
        touchedSections.has('LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER') &&
        blueprintSections.includes('LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER')
      ) {
        const data = lubricationHydraulicsRef.current?.getData();
        if (data) {
          payload.lubricationHydraulics = data;
        }
      }

      if (touchedSections.has('CLUTCH') && blueprintSections.includes('CLUTCH')) {
        const data = clutchRef.current?.getData();
        if (data) {
          payload.clutch = data;
        }
      }

      if (
        touchedSections.has('COUNTERBALANCE_CYLINDER_AIRBAG') &&
        blueprintSections.includes('COUNTERBALANCE_CYLINDER_AIRBAG')
      ) {
        const data = counterbalanceCylinderRef.current?.getData();
        if (data) {
          payload.counterbalanceCylinder = data;
        }
      }

      const response = await createService(payload);

      if (response.errors) {
        toast.error(t('form.error.title') + ' ' + response.errors.join(', '));
      } else {
        toast.success(t('createdSuccessfully'));
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error creating inspection:', error);
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
            <BearingClearanceSection
              ref={bearingClearanceRef}
              isOpen={bearingClearanceOpen}
              onOpenChange={setBearingClearanceOpen}
              onSectionTouched={() => markSectionTouched('BEARING_CLEARANCE')}
            />
          )}

          {/* Slide Section */}
          {blueprintSections.includes('SLIDE') && (
            <SlideSection
              ref={slideRef}
              isOpen={slideOpen}
              onOpenChange={setSlideOpen}
              onSectionTouched={() => markSectionTouched('SLIDE')}
            />
          )}

          {/* Gibs Section */}
          {blueprintSections.includes('GIBS') && (
            <GibsSection
              ref={gibsRef}
              isOpen={gibsOpen}
              onOpenChange={setGibsOpen}
              onSectionTouched={() => markSectionTouched('GIBS')}
            />
          )}

          {/* Lubrication Hydraulics Section */}
          {blueprintSections.includes('LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER') && (
            <LubricationHydraulicsSection
              ref={lubricationHydraulicsRef}
              isOpen={lubricationOpen}
              onOpenChange={setLubricationOpen}
              onSectionTouched={() =>
                markSectionTouched('LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER')
              }
            />
          )}

          {/* Clutch Section */}
          {blueprintSections.includes('CLUTCH') && (
            <ClutchSection
              ref={clutchRef}
              isOpen={clutchOpen}
              onOpenChange={setClutchOpen}
              onSectionTouched={() => markSectionTouched('CLUTCH')}
            />
          )}

          {/* Counterbalance Cylinder Section */}
          {blueprintSections.includes('COUNTERBALANCE_CYLINDER_AIRBAG') && (
            <CounterbalanceCylinderSection
              ref={counterbalanceCylinderRef}
              isOpen={counterbalanceOpen}
              onOpenChange={setCounterbalanceOpen}
              onSectionTouched={() => markSectionTouched('COUNTERBALANCE_CYLINDER_AIRBAG')}
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
