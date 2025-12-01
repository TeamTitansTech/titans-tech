'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BearingClearanceThresholds } from '@/components/alerts/BearingClearanceThresholds';
import { ClutchThresholds } from '@/components/alerts/ClutchThresholds';
import { SlideThresholds } from '@/components/alerts/SlideThresholds';
import { GibsThresholds } from '@/components/alerts/GibsThresholds';
import {
  getThresholdByBlueprint,
  getClutchThresholdByBlueprint,
  getSlideThresholdByBlueprint,
  getGibsThresholdByBlueprint,
  updateBearingClearanceThreshold,
  updateClutchThreshold,
  updateSlideThreshold,
  updateGibsThreshold,
} from '@/actions/alerts';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type {
  BearingClearanceThresholdsData,
  ClutchThresholdsData,
  SlideThresholdsData,
  GibsThresholdsData,
} from '@/components/alerts';

interface ThresholdEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  blueprintId: string;
  blueprintName: string;
  sections: string[];
}

export function ThresholdEditModal({
  isOpen,
  onClose,
  blueprintId,
  blueprintName,
  sections,
}: ThresholdEditModalProps) {
  const t = useTranslations();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [recalculateAlerts, setRecalculateAlerts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Threshold states
  const [bearingThresholds, setBearingThresholds] = useState<BearingClearanceThresholdsData | null>(
    null,
  );
  const [clutchThresholds, setClutchThresholds] = useState<ClutchThresholdsData | null>(null);
  const [slideThresholds, setSlideThresholds] = useState<SlideThresholdsData | null>(null);
  const [gibsThresholds, setGibsThresholds] = useState<GibsThresholdsData | null>(null);

  // Collapsible states for each section
  const [bearingOpen, setBearingOpen] = useState(true);
  const [clutchOpen, setClutchOpen] = useState(true);
  const [slideOpen, setSlideOpen] = useState(true);
  const [gibsOpen, setGibsOpen] = useState(true);

  // Check which sections are enabled
  const hasBearingClearance = sections.includes('BEARING_CLEARANCE');
  const hasClutch = sections.includes('CLUTCH');
  const hasSlide = sections.includes('SLIDE');
  const hasGibs = sections.includes('GIBS');

  const loadThresholds = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      type ThresholdResult =
        | { type: 'bearing'; data: BearingClearanceThresholdsData | null; error?: unknown }
        | { type: 'clutch'; data: ClutchThresholdsData | null; error?: unknown }
        | { type: 'slide'; data: SlideThresholdsData | null; error?: unknown }
        | { type: 'gibs'; data: GibsThresholdsData | null; error?: unknown };

      const promises: Promise<ThresholdResult>[] = [];

      if (hasBearingClearance) {
        promises.push(
          getThresholdByBlueprint(blueprintId).then(
            (result): ThresholdResult => ({
              type: 'bearing',
              data: result.data as BearingClearanceThresholdsData | null,
              error: result.error,
            }),
          ),
        );
      }

      if (hasClutch) {
        promises.push(
          getClutchThresholdByBlueprint(blueprintId).then(
            (result): ThresholdResult => ({
              type: 'clutch',
              data: result.data as ClutchThresholdsData | null,
              error: result.error,
            }),
          ),
        );
      }

      if (hasSlide) {
        promises.push(
          getSlideThresholdByBlueprint(blueprintId).then(
            (result): ThresholdResult => ({
              type: 'slide',
              data: result.data as SlideThresholdsData | null,
              error: result.error,
            }),
          ),
        );
      }

      if (hasGibs) {
        promises.push(
          getGibsThresholdByBlueprint(blueprintId).then(
            (result): ThresholdResult => ({
              type: 'gibs',
              data: result.data as GibsThresholdsData | null,
              error: result.error,
            }),
          ),
        );
      }

      const results = await Promise.all(promises);

      results.forEach((result) => {
        if (result.error) {
          console.error(`Failed to load ${result.type} threshold:`, result.error);
          return;
        }

        switch (result.type) {
          case 'bearing':
            setBearingThresholds(result.data);
            break;
          case 'clutch':
            setClutchThresholds(result.data);
            break;
          case 'slide':
            setSlideThresholds(result.data);
            break;
          case 'gibs':
            setGibsThresholds(result.data);
            break;
        }
      });
    } catch (err) {
      console.error('Failed to load thresholds:', err);
      setError(t('alerts.thresholds.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [blueprintId, hasBearingClearance, hasClutch, hasSlide, hasGibs, t]);

  // Load thresholds when modal opens
  useEffect(() => {
    if (isOpen) {
      loadThresholds();
    }
  }, [isOpen, loadThresholds]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      type UpdateResult = {
        data?: {
          recalculationResult?: {
            alertsGenerated?: number;
            servicesAffected?: number;
          };
        };
        error?: unknown;
      };

      const updatePromises: Promise<UpdateResult>[] = [];
      const sections: string[] = [];

      if (hasBearingClearance && bearingThresholds) {
        sections.push('Bearing Clearance');
        updatePromises.push(
          updateBearingClearanceThreshold(
            blueprintId,
            bearingThresholds,
            recalculateAlerts,
          ) as Promise<UpdateResult>,
        );
      }

      if (hasClutch && clutchThresholds) {
        sections.push('Clutch');
        updatePromises.push(
          updateClutchThreshold(
            blueprintId,
            clutchThresholds,
            recalculateAlerts,
          ) as Promise<UpdateResult>,
        );
      }

      if (hasSlide && slideThresholds) {
        sections.push('Slide');
        updatePromises.push(
          updateSlideThreshold(
            blueprintId,
            slideThresholds,
            recalculateAlerts,
          ) as Promise<UpdateResult>,
        );
      }

      if (hasGibs && gibsThresholds) {
        sections.push('Gibs');
        updatePromises.push(
          updateGibsThreshold(
            blueprintId,
            gibsThresholds,
            recalculateAlerts,
          ) as Promise<UpdateResult>,
        );
      }

      const results = await Promise.all(updatePromises);

      // Check for errors
      const errors = results.filter((r) => r.error);
      if (errors.length > 0) {
        setError(t('alerts.thresholds.recalculate.error'));
        return;
      }

      // Calculate total recalculation stats
      let totalAlertsGenerated = 0;
      let totalServicesAffected = 0;

      results.forEach((result) => {
        if (result.data?.recalculationResult) {
          totalAlertsGenerated += result.data.recalculationResult.alertsGenerated || 0;
          totalServicesAffected += result.data.recalculationResult.servicesAffected || 0;
        }
      });

      // Show success message
      if (recalculateAlerts && totalAlertsGenerated > 0) {
        toast.success(
          t('alerts.thresholds.recalculate.success', {
            count: totalAlertsGenerated,
            services: totalServicesAffected,
          }),
          {
            description: `${sections.join(', ')} thresholds updated.`,
          },
        );
      } else {
        toast.success(t('alerts.thresholds.recalculate.successNoRecalc'), {
          description: `${sections.join(', ')} thresholds updated.`,
        });
      }

      onClose();
    } catch (err) {
      console.error('Failed to update thresholds:', err);
      setError(t('alerts.recalculate.error'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('alerts.thresholds.editTitle', { name: blueprintName })}</DialogTitle>
          <DialogDescription>{t('alerts.thresholds.editDescription')}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Bearing Clearance Thresholds */}
            {hasBearingClearance && bearingThresholds && (
              <BearingClearanceThresholds
                open={bearingOpen}
                onOpenChange={setBearingOpen}
                data={bearingThresholds}
                onChange={setBearingThresholds}
              />
            )}

            {/* Clutch Thresholds */}
            {hasClutch && clutchThresholds && (
              <ClutchThresholds
                open={clutchOpen}
                onOpenChange={setClutchOpen}
                data={clutchThresholds}
                onChange={setClutchThresholds}
              />
            )}

            {/* Slide Thresholds */}
            {hasSlide && slideThresholds && (
              <SlideThresholds
                open={slideOpen}
                onOpenChange={setSlideOpen}
                data={slideThresholds}
                onChange={setSlideThresholds}
              />
            )}

            {/* Gibs Thresholds */}
            {hasGibs && gibsThresholds && (
              <GibsThresholds
                open={gibsOpen}
                onOpenChange={setGibsOpen}
                data={gibsThresholds}
                onChange={setGibsThresholds}
              />
            )}

            {/* Recalculate Alerts Checkbox */}
            <div className="flex items-start space-x-3 rounded-lg border p-4 bg-muted/50">
              <Checkbox
                id="recalculate"
                checked={recalculateAlerts}
                onCheckedChange={(checked) => setRecalculateAlerts(checked === true)}
                disabled={isSaving}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="recalculate"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t('alerts.thresholds.recalculate.label')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('alerts.thresholds.recalculate.description')}
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={isLoading || isSaving}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {recalculateAlerts ? t('alerts.thresholds.recalculate.updating') : t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
