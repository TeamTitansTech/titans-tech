'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
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
import { Badge } from '@/components/ui/badge';
import {
  Check,
  ChevronUp,
  FileSpreadsheet,
  FileText,
  Loader2,
  AlertCircle,
  Ruler,
  Thermometer,
  Gauge,
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ServiceType, type Service } from '@/data/types/services.types';
import { format } from 'date-fns';
import { SECTION_REGISTRY } from './sections/registry';
import { exportToExcel } from './utils/serviceExportUtils';
import { SectionSummary } from './summary';
import type { AnySectionData } from './types/service-completion.types';
import { UnitManagerProvider, useUnitManager } from '@/contexts/UnitManagerContext';

interface ServiceSummaryModalProps {
  service: Service;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hideExcelExport?: boolean;
}

export function ServiceSummaryModal({
  service,
  open,
  onOpenChange,
  hideExcelExport,
}: ServiceSummaryModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[95vh] max-h-[95vh] w-[98vw] max-w-[98vw] flex-col overflow-hidden sm:h-[90vh] sm:max-h-[90vh] sm:w-[95vw] sm:max-w-[1200px]">
        <UnitManagerProvider>
          <ServiceSummaryModalContent
            service={service}
            onOpenChange={onOpenChange}
            hideExcelExport={hideExcelExport}
          />
        </UnitManagerProvider>
      </DialogContent>
    </Dialog>
  );
}

function ServiceSummaryModalContent({
  service,
  onOpenChange,
  hideExcelExport,
}: Omit<ServiceSummaryModalProps, 'open'>) {
  const t = useTranslations('machines');
  const tServices = useTranslations('services');
  const tServicesSummary = useTranslations('services.modal.summary');
  const tActions = useTranslations('actions');
  const tInspections = useTranslations('inspections.form.enums');
  const tUnits = useTranslations('forms.units');
  const { lengthUnit, setLengthUnit, getTemperatureUnitLabel, getPressureUnitLabel } =
    useUnitManager();

  const isInspection = service.type === ServiceType.INSPECTION;
  // Check if this service was created from a service request
  const isFromServiceRequest = !!service.serviceRequestId;

  // Ref for the content to capture as PDF
  const contentRef = useRef<HTMLDivElement>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

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
    bearingClearanceSingleHammer: 'BEARING_CLEARANCE_SINGLE_HAMMER',
    slideSingleHammer: 'SLIDE_SINGLE_HAMMER',
    slideDoubleHammer: 'SLIDE_DOUBLE_HAMMER',
    gibs: 'GIBS',
    lubricationHydraulics: 'LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER',
    clutch: 'CLUTCH',
    counterbalanceCylinder: 'COUNTERBALANCE_CYLINDER_AIRBAG',
    counterbalanceCylinderAirbag: 'COUNTERBALANCE_CYLINDER_AIRBAG',
    tramming: 'TRAMMING',
    pistons: 'PISTONS',
    shimThickness: 'SHIM_THICKNESS',
    dieCushion: 'DIE_CUSHION',
    electricalControl: 'ELECTRICAL_CONTROL',
    perpendicularity: 'PERPENDICULARITY',
    angularity: 'ANGULARITY',
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

    // For wrapped structures (clutch, lubricationHydraulics, counterbalance)
    // Check the nested 'data' property
    if ('data' in data && data.data && typeof data.data === 'object') {
      return checkNestedData(data.data);
    }

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
  const completedSectionData: Record<string, AnySectionData> = {};

  Object.entries(service).forEach(([key, value]) => {
    const registryKey = SECTION_DATA_TO_REGISTRY_KEY[key];
    if (registryKey && value !== null && value !== undefined) {
      // Extract data from array structure (backend returns arrays)
      // Note: Type assertion needed because Object.entries() loses property-specific types
      // We've validated this is a section property via SECTION_DATA_TO_REGISTRY_KEY check
      const extractedData: AnySectionData = (
        Array.isArray(value) ? value[0] : value
      ) as AnySectionData;

      // NOTE: We no longer extract the nested .data property here
      // SectionSummary components handle the wrapped/unwrapped structure detection
      // and this preserves the attachments which are on the parent wrapper object

      // Only show sections that have actual data
      if (hasDataContent(extractedData as Record<string, unknown>)) {
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
    });
  };

  // Handle export to PDF - captures the rendered component
  const handleExportToPDF = async () => {
    if (!contentRef.current) return;

    setIsExportingPDF(true);
    try {
      const element = contentRef.current;

      // Store original styles
      const originalStyle = {
        height: element.style.height,
        overflow: element.style.overflow,
        maxHeight: element.style.maxHeight,
      };

      // Temporarily expand to show all content
      element.style.height = 'auto';
      element.style.overflow = 'visible';
      element.style.maxHeight = 'none';

      // Wait for styles to apply
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      // Restore original styles
      element.style.height = originalStyle.height;
      element.style.overflow = originalStyle.overflow;
      element.style.maxHeight = originalStyle.maxHeight;

      const imgData = canvas.toDataURL('image/png');

      // Calculate dimensions for a pageless PDF (single continuous page)
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const pdfWidth = 210; // A4 width in mm
      const margin = 10;
      const contentWidth = pdfWidth - 2 * margin;
      const ratio = contentWidth / imgWidth;
      const scaledHeight = imgHeight * ratio;
      const pdfHeight = scaledHeight + 2 * margin;

      // Create PDF with custom height to fit all content
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight],
      });

      // Add the entire image on one page
      pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, scaledHeight);

      const filename = `${isInspection ? 'Inspecao' : 'Manutencao'}_${format(new Date(service.date || new Date()), 'yyyy-MM-dd')}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <>
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

      <div ref={contentRef} className="flex-1 overflow-y-auto bg-background px-4 py-4">
        {/* Service Details Summary */}
        <div className="mb-4 rounded-lg border p-4">
          <Typography variant="h4" className="mb-3 font-semibold">
            {tServicesSummary('serviceDetails')}
          </Typography>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
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
          </div>

          {/* Selected Units Display */}
          <div className="mt-4 border-t pt-4">
            <Label className="mb-2 block text-xs text-muted-foreground">
              {tUnits('selectedUnits')}
            </Label>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-1.5">
                <Ruler className="h-4 w-4 text-muted-foreground" />
                <span className="mr-2 text-sm">{tUnits('lengthLabel')}:</span>
                <div className="flex items-center rounded-md border bg-background">
                  <Button
                    type="button"
                    variant={lengthUnit === 'mm' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-6 rounded-r-none px-2 text-xs"
                    onClick={() => setLengthUnit('mm')}
                  >
                    mm
                  </Button>
                  <Button
                    type="button"
                    variant={lengthUnit === 'inches' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-6 rounded-l-none px-2 text-xs"
                    onClick={() => setLengthUnit('inches')}
                  >
                    in
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-1.5">
                <Thermometer className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {tUnits('temperatureLabel')}:{' '}
                  <span className="font-medium">{getTemperatureUnitLabel()}</span>
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-1.5">
                <Gauge className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {tUnits('pressureLabel')}:{' '}
                  <span className="font-medium">{getPressureUnitLabel()}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Inspection Observation Fields */}
          <div className="mt-4 grid grid-cols-1 gap-3 border-t pt-4 sm:grid-cols-2 sm:gap-4">
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

        {/* Attached Documents */}
        {service.attachments && service.attachments.length > 0 && (
          <div className="mb-4 rounded-lg border p-4">
            <Typography variant="h4" className="mb-3 font-semibold">
              {tServices('modal.attachedDocuments.title')}
            </Typography>
            <div className="space-y-2">
              {service.attachments.map((attachment, index) => {
                const isCSV = attachment.name.toLowerCase().endsWith('.csv');
                return (
                  <a
                    key={`${attachment.url}-${index}`}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-md bg-muted/30 px-3 py-2 transition-colors hover:bg-muted/50"
                  >
                    {isCSV ? (
                      <FileSpreadsheet className="h-5 w-5 flex-shrink-0 text-green-600" />
                    ) : (
                      <FileText className="h-5 w-5 flex-shrink-0 text-red-600" />
                    )}
                    <span className="truncate text-sm font-medium hover:underline">
                      {attachment.name}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Public Request Section - Show if this service was created from a service request */}
        {isFromServiceRequest && (
          <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:bg-orange-900/20">
            <div className="mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <Typography variant="h4" className="font-semibold">
                {tServices('publicRequestDetails.title')}
              </Typography>
              <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                {tServices('publicRequest')}
              </Badge>
            </div>
            <Typography variant="small" className="text-muted-foreground">
              {tServices('publicRequestDetails.createdFromRequest')}
            </Typography>
          </div>
        )}

        {/* Sections Summary */}
        <div className="mb-4 rounded-lg border p-4">
          <Typography variant="h4" className="mb-3 font-semibold">
            {tServicesSummary('filledAreas')}
          </Typography>
          <div className="space-y-2">
            {completedSections.map((sectionKey) => {
              const sectionConfig = SECTION_REGISTRY[sectionKey];
              if (!sectionConfig) return null;
              return (
                <div
                  key={sectionKey}
                  className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                >
                  <Check className="h-4 w-4" />
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
                <div className="rounded-lg border">
                  <CollapsibleTrigger className="group flex w-full items-center justify-between p-3 transition-colors hover:bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Typography variant="h4" className="text-sm font-semibold">
                        {t(`sectionNames.${sectionConfig.metadata.i18nKey}`)}
                      </Typography>
                      <span className="text-xs text-green-600 dark:text-green-400">
                        ({tServices('modal.status.complete')})
                      </span>
                    </div>
                    <ChevronUp className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
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

      <div className="flex flex-col gap-3 border-t px-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {!hideExcelExport && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportToExcel}
              className="flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span className="hidden sm:inline">{tServicesSummary('exportExcel')}</span>
              <span className="sm:hidden">Excel</span>
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportToPDF}
            disabled={isExportingPDF}
            className="flex items-center gap-2"
          >
            {isExportingPDF ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">{tServicesSummary('exportPDF')}</span>
            <span className="sm:hidden">PDF</span>
          </Button>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => onOpenChange(false)}
          className="w-full sm:w-auto"
        >
          {tActions('close')}
        </Button>
      </div>
    </>
  );
}
