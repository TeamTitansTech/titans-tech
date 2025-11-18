'use client';

import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { Label } from '@/components/ui/label';
import { Check, ChevronUp, FileSpreadsheet, FileText } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ServiceType, type Service } from '@/data/types/services.types';
import { format } from 'date-fns';
import { SECTION_REGISTRY } from './sections/registry';
import { exportToExcel, exportToPDF } from './utils/serviceExportUtils';
import { SectionSummary } from './summary';

interface ServiceSummaryModalProps {
  service: Service;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ServiceSummaryModal({ service, open, onOpenChange }: ServiceSummaryModalProps) {
  const t = useTranslations('machines');
  const tServices = useTranslations('services');
  const tServicesSummary = useTranslations('services.modal.summary');
  const tActions = useTranslations('actions');
  const tInspections = useTranslations('inspections.form.enums');

  const isInspection = service.type === ServiceType.INSPECTION;

  // Helper function to format enum values for display
  const formatEnumValue = (value: string | undefined, enumType: string) => {
    if (!value) return '-';
    const translationKey = `${enumType}.${value.toLowerCase()}`;
    const translated = tInspections(translationKey);

    // If translation key is returned as-is, return the original value
    if (translated === translationKey || translated.includes('inspections.form.enums')) {
      return value;
    }

    return translated;
  };

  // Map section data keys to section registry keys
  const SECTION_DATA_TO_REGISTRY_KEY: Record<string, string> = {
    bearingClearance: 'BEARING_CLEARANCE',
    slide: 'SLIDE',
    gibs: 'GIBS',
    lubricationHydraulics: 'LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER',
    clutch: 'CLUTCH',
    counterbalanceCylinder: 'COUNTERBALANCE_CYLINDER_AIRBAG',
    counterbalanceCylinderAirbag: 'COUNTERBALANCE_CYLINDER_AIRBAG',
    tramming: 'TRAMMING',
    pistons: 'PISTONS',
  };

  // Helper to check if section data has actual content
  const hasDataContent = (data: Record<string, unknown>): boolean => {
    if (!data || typeof data !== 'object') return false;

    // Check if any nested object has data
    const checkNestedData = (obj: unknown): boolean => {
      if (!obj || typeof obj !== 'object') return false;
      return Object.values(obj as Record<string, unknown>).some(
        (val) => val !== null && val !== undefined && val !== '',
      );
    };

    // For objects with nested structure (bearingClearance, slide, gibs)
    if (
      data.outerData ||
      data.innerData ||
      data.outerBefore ||
      data.innerBefore ||
      data.outerAfter ||
      data.innerAfter
    ) {
      return (
        checkNestedData(data.outerData) ||
        checkNestedData(data.innerData) ||
        checkNestedData(data.outerBefore) ||
        checkNestedData(data.innerBefore) ||
        checkNestedData(data.outerAfter) ||
        checkNestedData(data.innerAfter)
      );
    }

    // For flat objects (other sections)
    return Object.values(data).some((val) => val !== null && val !== undefined && val !== '');
  };

  // Get all sections that have data in this service
  const completedSections: string[] = [];
  const completedSectionData: Record<string, Record<string, unknown>> = {};

  Object.entries(service).forEach(([key, value]) => {
    const registryKey = SECTION_DATA_TO_REGISTRY_KEY[key];
    if (registryKey && value !== null && value !== undefined) {
      // Extract data from array structure (backend returns arrays)
      let extractedData = value;

      // Check if it's an array and extract first element
      if (Array.isArray(value) && value.length > 0) {
        extractedData = value[0];

        // For clutch, lubricationHydraulics, and counterbalanceCylinder, extract nested data object
        if (
          key === 'clutch' ||
          key === 'lubricationHydraulics' ||
          key === 'counterbalanceCylinder' ||
          key === 'counterbalanceCylinderAirbag'
        ) {
          // Check if there's a nested 'data' property (for clutch and lubrication)
          if (extractedData.data) {
            extractedData = extractedData.data;
          }
          // For counterbalance, the structure might have outerData/innerData at the wrapper level
          // We'll keep the whole object but filter ID fields during rendering
        }
      }

      // Debug logging for bearing clearance
      if (key === 'bearingClearance') {
        console.log('Bearing Clearance Data:', {
          raw: value,
          extracted: extractedData,
          hasDataContent: hasDataContent(extractedData),
        });
      }

      // For inspections, show all sections even if empty
      // For maintenance, only show sections with actual data
      if (isInspection || hasDataContent(extractedData)) {
        completedSections.push(registryKey);
        completedSectionData[registryKey] = extractedData;
      }
    }
  });

  // Handle export to Excel
  const handleExportToExcel = () => {
    exportToExcel({
      service,
      completedSections,
      completedSectionData,
      sectionRegistry: SECTION_REGISTRY,
      translationCallbacks: {
        getSectionName: (key: string) => {
          const sectionConfig = SECTION_REGISTRY[key];
          return sectionConfig ? t(`sectionNames.${sectionConfig.metadata.i18nKey}`) : key;
        },
        getServiceTypeName: () => {
          return isInspection
            ? tServices('modal.inspectionSummary')
            : tServices('modal.maintenanceSummary');
        },
      },
    });
  };

  // Handle export to PDF
  const handleExportToPDF = () => {
    exportToPDF({
      service,
      completedSections,
      completedSectionData,
      sectionRegistry: SECTION_REGISTRY,
      translationCallbacks: {
        getSectionName: (key: string) => {
          const sectionConfig = SECTION_REGISTRY[key];
          return sectionConfig ? t(`sectionNames.${sectionConfig.metadata.i18nKey}`) : key;
        },
        getServiceTypeName: () => {
          return isInspection
            ? tServices('modal.inspectionSummary')
            : tServices('modal.maintenanceSummary');
        },
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[1200px] h-[85vh] max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isInspection ? tServicesSummary('inspectionTitle') : tServicesSummary('title')}
          </DialogTitle>
          <DialogDescription>
            {isInspection
              ? tServicesSummary('inspectionDetails')
              : tServicesSummary('maintenanceDetails')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {/* Service Details Summary */}
          <div className="border rounded-lg p-4 mb-4">
            <Typography variant="h4" className="font-semibold mb-3">
              {tServicesSummary('serviceDetails')}
            </Typography>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">
                  {tServices('modal.realizationDate')}
                </Label>
                <div className="text-sm font-medium">
                  {service.date ? format(new Date(service.date), 'PPP') : '-'}
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  {tServices('modal.performedBy')}
                </Label>
                <div className="text-sm font-medium">{service.performedBy || '-'}</div>
              </div>

              {/* Add all inspection observation fields here */}
              <div>
                <Label className="text-xs text-muted-foreground">
                  {tServices('modal.inspectionObservations.isPressLevel')}
                </Label>
                <div className="text-sm font-medium">
                  {formatEnumValue(service.isPressLevel, 'yesNoNaDnc')}
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  {tServices('modal.inspectionObservations.driveBeltCondition')}
                </Label>
                <div className="text-sm font-medium">
                  {formatEnumValue(service.driveBeltCondition, 'driveBeltCondition')}
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  {tServices('modal.inspectionObservations.areAllProtectiveCovers')}
                </Label>
                <div className="text-sm font-medium">
                  {formatEnumValue(service.areAllProtectiveCovers, 'protectiveCoversStatus')}
                </div>
              </div>
              {service.areAllProtectiveCovers === 'NO' && (
                <div>
                  <Label className="text-xs text-muted-foreground">
                    {tServices('modal.inspectionObservations.whyNotCovered')}
                  </Label>
                  <div className="text-sm font-medium">
                    {formatEnumValue(service.whyNotCovered, 'whyNotCovered')}
                  </div>
                </div>
              )}
              {service.areAllProtectiveCovers === 'NO' &&
                service.whyNotCovered === 'OTHER_EXPLAIN' && (
                  <div className="col-span-2">
                    <Label className="text-xs text-muted-foreground">
                      {tServices('modal.inspectionObservations.protectiveCoversExplanation')}
                    </Label>
                    <div className="text-sm font-medium">
                      {service.protectiveCoversExplanation || '-'}
                    </div>
                  </div>
                )}
              <div>
                <Label className="text-xs text-muted-foreground">
                  {tServices('modal.inspectionObservations.areCracksVisible')}
                </Label>
                <div className="text-sm font-medium">
                  {formatEnumValue(service.areCracksVisible, 'yesNoDnc')}
                </div>
              </div>
              {service.areCracksVisible === 'YES' && (
                <div>
                  <Label className="text-xs text-muted-foreground">
                    {tServices('modal.inspectionObservations.cracksLocation')}
                  </Label>
                  <div className="text-sm font-medium">{service.cracksLocation || '-'}</div>
                </div>
              )}
              <div>
                <Label className="text-xs text-muted-foreground">
                  {tServices('modal.inspectionObservations.isMainMotorSecure')}
                </Label>
                <div className="text-sm font-medium">
                  {formatEnumValue(service.isMainMotorSecure, 'yesNoDnc')}
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  {tServices('modal.inspectionObservations.isMotorPlateSecure')}
                </Label>
                <div className="text-sm font-medium">
                  {formatEnumValue(service.isMotorPlateSecure, 'yesNoDnc')}
                </div>
              </div>
            </div>
          </div>

          {/* Sections Summary */}
          <div className="border rounded-lg p-4 mb-4">
            <Typography variant="h4" className="font-semibold mb-3">
              {tServicesSummary('filledAreas')}
            </Typography>
            <div className="space-y-2">
              {completedSections.map((sectionKey) => {
                const sectionConfig = SECTION_REGISTRY[sectionKey];
                if (!sectionConfig) return null;
                return (
                  <div
                    key={sectionKey}
                    className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-md"
                  >
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {t(`sectionNames.${sectionConfig.metadata.i18nKey}`)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Data Review */}
          <div className="space-y-3">
            <Typography variant="h4" className="font-semibold">
              {tServicesSummary('filledData')}
            </Typography>

            {/* Loop through ALL completed sections */}
            {completedSections.map((sectionKey) => {
              const sectionConfig = SECTION_REGISTRY[sectionKey];
              if (!sectionConfig) return null;

              const data = completedSectionData[sectionKey];

              return (
                <Collapsible key={sectionKey} defaultOpen={true}>
                  <div className="border rounded-lg">
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors group">
                      <div className="flex items-center gap-2">
                        <Typography variant="h4" className="font-semibold text-sm">
                          {t(`sectionNames.${sectionConfig.metadata.i18nKey}`)}
                        </Typography>
                        <span className="text-xs text-green-600 dark:text-green-400">
                          ({tServices('modal.status.complete')})
                        </span>
                      </div>
                      <ChevronUp className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-3 pt-0 text-xs">
                      <SectionSummary sectionKey={sectionKey} data={data} />
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between items-center gap-3 pt-4 px-4 border-t">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleExportToExcel}
              className="flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              {tServicesSummary('exportExcel')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleExportToPDF}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              {tServicesSummary('exportPDF')}
            </Button>
          </div>
          <Button type="button" onClick={() => onOpenChange(false)}>
            {tActions('close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
