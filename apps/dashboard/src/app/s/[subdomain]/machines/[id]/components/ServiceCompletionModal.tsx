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
import { Typography } from '@/components/ui/typography';
import { SelectableSectionCard } from '@/components/SelectableSectionCard';
import type { SectionStatus } from '@/components/SelectableSectionCard';
import { ChevronLeft } from 'lucide-react';

interface ServiceCompletionModalProps {
  machineId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  machineSections?: string[];
}

const SECTION_DETAILS = {
  BEARING_CLEARANCE: {
    key: 'BEARING_CLEARANCE',
    image: '/assets/sections/bearing-clearance.svg',
    i18nKey: 'bearingClearance',
  },
  SLIDE: {
    key: 'SLIDE',
    image: '/assets/sections/slide.svg',
    i18nKey: 'slide',
  },
  GIBS: {
    key: 'GIBS',
    image: '/assets/sections/gibs.svg',
    i18nKey: 'gibs',
  },
  LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER: {
    key: 'LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER',
    image: '/assets/sections/lubrication-hydraulics.svg',
    i18nKey: 'lubricationHydraulics',
  },
  CLUTCH: {
    key: 'CLUTCH',
    image: '/assets/sections/clutch.svg',
    i18nKey: 'clutch',
  },
  COUNTERBALANCE_CYLINDER_AIRBAG: {
    key: 'COUNTERBALANCE_CYLINDER_AIRBAG',
    image: '/assets/sections/counterbalance.svg',
    i18nKey: 'counterbalance',
  },
} as const;

export function ServiceCompletionModal({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  machineId,
  open,
  onOpenChange,
  machineSections = Object.keys(SECTION_DETAILS),
}: ServiceCompletionModalProps) {
  const t = useTranslations('machines');
  const tInspections = useTranslations('inspections');

  // Multi-step state
  const [currentStep, setCurrentStep] = useState<'selection' | 'forms'>('selection');

  // Section selection state
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set());

  // Basic inspection data
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [performedBy, setPerformedBy] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      setCurrentStep('selection');
      setSelectedSections(new Set());
      setDate(new Date().toISOString().split('T')[0]);
      setIsMaintenance(false);
      setPerformedBy('');
    }
  }, [open]);

  const toggleSection = (sectionKey: string) => {
    setSelectedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionKey)) {
        newSet.delete(sectionKey);
      } else {
        newSet.add(sectionKey);
      }
      return newSet;
    });
  };

  const handleProceedToForms = () => {
    if (selectedSections.size === 0) {
      return;
    }
    setCurrentStep('forms');
  };

  const handleBackToSelection = () => {
    setCurrentStep('selection');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Here you would call the actual API with the selected sections
      // For now, just a placeholder
      console.log('Selected sections:', Array.from(selectedSections));
      console.log('Date:', date);
      console.log('Is Maintenance:', isMaintenance);
      console.log('Performed By:', performedBy);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // toast.success(tInspections('createdSuccessfully'));
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating inspection:', error);
      // toast.error('Error creating inspection');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mock function to get section status - replace with actual logic
  const getSectionStatus = (sectionKey: string): SectionStatus => {
    // This should check the latest inspection data for this section
    // For now, return 'unknown' as placeholder;~
    console.log(sectionKey);
    return 'unknown';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[900px] h-[700px] max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {currentStep === 'selection'
              ? tInspections('title')
              : tInspections('title') + ' - ' + t('inspectionSections')}
          </DialogTitle>
          <DialogDescription>
            {currentStep === 'selection'
              ? 'Selecione as áreas de manutenção a serem realizadas'
              : tInspections('description')}
          </DialogDescription>
        </DialogHeader>

        {currentStep === 'selection' ? (
          // Step 1: Section Selection
          <div className="flex-1 overflow-y-auto py-4">
            <Typography variant="h4" className="mb-4 px-1">
              Áreas de Manutenção
            </Typography>
            <Typography variant="muted" className="mb-6 px-1 text-sm">
              Selecione as áreas onde a manutenção será realizada
            </Typography>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {machineSections.map((sectionKey) => {
                const section = SECTION_DETAILS[sectionKey as keyof typeof SECTION_DETAILS];
                if (!section) return null;

                return (
                  <SelectableSectionCard
                    key={section.key}
                    title={t(`sectionNames.${section.i18nKey}`)}
                    status={getSectionStatus(section.key)}
                    imageUrl={section.image}
                    subtitle="CP 2"
                    isSelected={selectedSections.has(section.key)}
                    onClick={() => toggleSection(section.key)}
                  />
                );
              })}
            </div>

            <div className="mt-6 px-1 text-sm text-muted-foreground">
              {selectedSections.size > 0
                ? `${selectedSections.size} ${selectedSections.size === 1 ? 'área selecionada' : 'áreas selecionadas'}`
                : 'Selecione as áreas de manutenção acima para começar'}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleProceedToForms}
                disabled={selectedSections.size === 0}
              >
                Continuar
              </Button>
            </div>
          </div>
        ) : (
          // Step 2: Forms for Selected Sections
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-6 py-4">
            <div className="flex items-center gap-2 mb-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleBackToSelection}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar para seleção
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">{tInspections('form.date.label')}</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="performedBy">{tInspections('form.performedBy.label')}</Label>
                <Input
                  id="performedBy"
                  value={performedBy}
                  onChange={(e) => setPerformedBy(e.target.value)}
                  placeholder={tInspections('form.performedBy.placeholder')}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isMaintenance"
                checked={isMaintenance}
                onCheckedChange={(checked: boolean) => setIsMaintenance(checked)}
              />
              <Label htmlFor="isMaintenance" className="cursor-pointer">
                {tInspections('form.isMaintenance.label')}
              </Label>
            </div>

            {/* Section Forms - Add your section-specific forms here */}
            <div className="space-y-6">
              {Array.from(selectedSections).map((sectionKey) => {
                const section = SECTION_DETAILS[sectionKey as keyof typeof SECTION_DETAILS];
                if (!section) return null;

                return (
                  <div key={section.key} className="border rounded-lg p-6">
                    <Typography variant="h3" className="mb-4">
                      {t(`sectionNames.${section.i18nKey}`)}
                    </Typography>
                    <Typography variant="muted" className="text-sm">
                      Formulário para {t(`sectionNames.${section.i18nKey}`)} será implementado aqui
                    </Typography>
                    {/* Add section-specific form fields here */}
                    {/* For BEARING_CLEARANCE, use the existing RenderBearingFields component */}
                    {/* For other sections, create similar form components */}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={handleBackToSelection}>
                Voltar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? tInspections('form.submit.loading')
                  : tInspections('form.submit.idle')}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
