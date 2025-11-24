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
import { format } from 'date-fns';
import { toast } from 'sonner';
import { updateService } from '@/data/services/services.api';
import {
  ServiceType,
  ServiceStatus,
  type UpdateServicePayload,
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

interface CompleteServiceModalProps extends InspectionModalProps {
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

  const [date, setDate] = useState<Date>(initialDate ? new Date(initialDate) : new Date());
  const [performedBy, setPerformedBy] = useState(initialPerformedBy || '');

  // Track which sections have been touched
  const [touchedSections, setTouchedSections] = useState<Set<string>>(new Set());

  // Collapsible section states
  const [slideOpen, setSlideOpen] = useState(false);
  const [gibsOpen, setGibsOpen] = useState(false);

  // Section refs
  const bearingClearanceRef = useRef<BearingClearanceSectionRef>(null);
  const slideRef = useRef<SlideSectionRef>(null);
  const gibsRef = useRef<GibsSectionRef>(null);
  const lubricationRef = useRef<LubricationHydraulicsSectionRef>(null);
  const clutchRef = useRef<ClutchSectionRef>(null);
  const counterbalanceRef = useRef<CounterbalanceCylinderSectionRef>(null);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setDate(initialDate ? new Date(initialDate) : new Date());
      setPerformedBy(initialPerformedBy || '');
      setTouchedSections(new Set());
      // Reset section refs
      bearingClearanceRef.current?.reset();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validationErrors: string[] = [];

      // Bearing Clearance validation
      if (
        touchedSections.has('BEARING_CLEARANCE') &&
        blueprintSections.includes('BEARING_CLEARANCE') &&
        bearingClearanceRef.current
      ) {
        const bearingErrors = bearingClearanceRef.current.validate(serviceType);
        validationErrors.push(...bearingErrors);
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
        date: date.toISOString(),
        type: serviceType,
        performedBy: performedBy || undefined,
      };

      // Only add bearing clearance if section was touched
      if (
        touchedSections.has('BEARING_CLEARANCE') &&
        blueprintSections.includes('BEARING_CLEARANCE') &&
        bearingClearanceRef.current
      ) {
        const bearingData = bearingClearanceRef.current.getData();
        payload.bearingClearance = bearingData;
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
      <DialogContent className="w-[900px] h-[700px] max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {serviceType === ServiceType.MAINTENANCE
                ? 'Complete Maintenance'
                : 'Complete Inspection'}
            </DialogTitle>
            <DialogDescription>
              {serviceType === ServiceType.MAINTENANCE
                ? 'Complete this maintenance service by adding measurement data'
                : 'Complete this inspection by adding measurement data'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border rounded-lg p-6 bg-muted/30">
              <h3 className="text-base font-semibold mb-4">Service Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>
                    {serviceType === ServiceType.MAINTENANCE ? 'Service Date' : 'Inspection Date'}
                  </Label>
                  <p className="text-sm font-medium mt-1">{date ? format(date, 'PPP') : '-'}</p>
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

            {blueprintSections.includes('BEARING_CLEARANCE') && (
              <BearingClearanceSection
                ref={bearingClearanceRef}
                onSectionTouched={() => markSectionTouched('BEARING_CLEARANCE')}
                serviceType={serviceType}
              />
            )}

            {blueprintSections.includes('SLIDE') && (
              <SlideSection
                ref={slideRef}
                isOpen={slideOpen}
                onOpenChange={setSlideOpen}
                serviceType={serviceType}
              />
            )}

            {blueprintSections.includes('GIBS') && (
              <GibsSection ref={gibsRef} isOpen={gibsOpen} onOpenChange={setGibsOpen} />
            )}

            {blueprintSections.includes('LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER') && (
              <LubricationHydraulicsSection
                ref={lubricationRef}
                onSectionTouched={() =>
                  markSectionTouched('LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER')
                }
              />
            )}

            {blueprintSections.includes('CLUTCH') && (
              <ClutchSection
                ref={clutchRef}
                onSectionTouched={() => markSectionTouched('CLUTCH')}
              />
            )}

            {blueprintSections.includes('COUNTERBALANCE_CYLINDER_AIRBAG') && (
              <CounterbalanceCylinderSection
                ref={counterbalanceRef}
                onSectionTouched={() => markSectionTouched('COUNTERBALANCE_CYLINDER_AIRBAG')}
              />
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('form.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('form.submit.loading') : t('form.submit.idle')}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
