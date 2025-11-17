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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServiceType, type Service } from '@/data/types/services.types';
import { format } from 'date-fns';
import { SECTION_REGISTRY } from './sections/registry';
import { exportToExcel, exportToPDF } from './utils/serviceExportUtils';
import { TrammingForm } from './forms/TrammingForm';

interface ServiceSummaryModalProps {
  service: Service;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ServiceSummaryModal({ service, open, onOpenChange }: ServiceSummaryModalProps) {
  const t = useTranslations('machines');
  const tServices = useTranslations('services');
  const tSlide = useTranslations('inspections.form.slide');
  const tSlideFields = useTranslations('inspections.form.slide.fields');
  const tTable = useTranslations('table');
  const tMeasurements = useTranslations('measurements');
  const tServicesSummary = useTranslations('services.modal.summary');
  const tBearingFields = useTranslations('bearingFields');
  const tBearingClearanceFields = useTranslations('inspections.form.bearingClearance.fields');
  const tClutchFields = useTranslations('inspections.form.clutch.fields');
  const tCounterbalanceFields = useTranslations('inspections.form.counterbalanceCylinder');
  const tTrammingFields = useTranslations('inspections.form.tramming');
  const tActions = useTranslations('actions');

  const isInspection = service.type === ServiceType.INSPECTION;

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
  };

  // Helper to check if section data has actual content
  const hasDataContent = (data: any): boolean => {
    if (!data || typeof data !== 'object') return false;

    // Check if any nested object has data
    const checkNestedData = (obj: any): boolean => {
      if (!obj || typeof obj !== 'object') return false;
      return Object.values(obj).some((val) => val !== null && val !== undefined && val !== '');
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
  const completedSectionData: Record<string, any> = {};

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

  // Helper function to check if a field is an ID field
  const isIdField = (key: string): boolean => {
    const lowerKey = key.toLowerCase();
    return (
      key === 'id' ||
      key.endsWith('Id') ||
      key.endsWith('ID') ||
      lowerKey === 'id' ||
      lowerKey === 'createdat' ||
      lowerKey === 'updatedat' ||
      key === 'createdAt' ||
      key === 'updatedAt' ||
      key === 'created_at' ||
      key === 'updated_at'
    );
  };

  // Helper function to check if a field should be shown in Slide section summary
  const isSlideFieldAllowedInSummary = (key: string): boolean => {
    // Position fields (not allowed)
    if (key.startsWith('position')) return false;

    // Only allow specific fields
    const allowedFields = [
      // These fields are at the section level, not in nested objects
      'outerParallelism',
      'outerHasParallelismBeenAdjusted',
      'innerParallelism',
      'innerHasParallelismBeenAdjusted',
      'outerShutheightIndicatorsChecked',
      'outerOverloadsOnTonnageMonitor',
      'outerShutheightActualSh',
      'outerIndicatorReading',
      'innerShutheightIndicatorsChecked',
      'innerOverloadsOnTonnageMonitor',
      'innerShutheightActualSh',
      'innerIndicatorReading',
      'notes',
    ];

    return allowedFields.includes(key);
  };

  // Helper function to calculate max deviation from slide position data
  const calculateMaxDeviation = (data: any): string => {
    if (!data) return '-';

    const positions = [
      data.position1,
      data.position2,
      data.position3,
      data.position4,
      data.position5,
      data.position6,
    ];
    const validValues = positions.filter(
      (val) => val !== undefined && val !== null && !isNaN(val) && val !== 0,
    );

    if (validValues.length > 1) {
      const max = Math.max(...validValues);
      const min = Math.min(...validValues);
      return (max - min).toFixed(4);
    }
    return '-';
  };

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

  // Helper function to format field names
  const formatFieldName = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .trim()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Helper function to translate field names based on section
  const translateFieldName = (key: string, sectionKey?: string): string => {
    // Try to get translation based on section
    if (sectionKey === 'BEARING_CLEARANCE') {
      // Try bearing clearance fields first
      const translation = tBearingClearanceFields(key);
      if (translation !== key) return translation;
    } else if (sectionKey === 'SLIDE') {
      // Try slide fields
      const translation = tSlideFields(key);
      if (translation !== key) return translation;
    } else if (sectionKey === 'CLUTCH') {
      // Try clutch fields
      const translation = tClutchFields(key);
      if (translation !== key) return translation;
    } else if (sectionKey === 'COUNTERBALANCE_CYLINDER_AIRBAG') {
      // Try counterbalance fields
      const translation = tCounterbalanceFields(key);
      if (translation !== key) return translation;
    } else if (sectionKey === 'GIBS') {
      // Gibs uses similar field names to bearing clearance
      const translation = tBearingClearanceFields(key);
      if (translation !== key) return translation;
    } else if (sectionKey === 'TRAMMING') {
      // Try tramming fields
      const translation = tTrammingFields(key);
      if (translation !== key) return translation;
    }

    // Fallback to formatFieldName for fields without translations
    return formatFieldName(key);
  };

  // Helper function to display value or "-" for empty
  const displayValue = (value: any): string => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    // Handle enum translations
    const stringValue = String(value);

    // Translate ParallelismType values
    if (stringValue === 'TO_BED') {
      return tSlide('toBed');
    }
    if (stringValue === 'TO_BOLSTER') {
      return tSlide('toBolster');
    }
    if (stringValue === 'DNC') {
      return tSlide('dnc');
    }

    // Translate Yes/No/NA values
    if (stringValue === 'YES') {
      return tSlide('yes');
    }
    if (stringValue === 'NO') {
      return tSlide('no');
    }
    if (stringValue === 'NA') {
      return tSlide('na');
    }

    return stringValue;
  };

  // Helper function to extract bearing measurement rows
  const extractBearingRows = (data: any, sectionKey?: string) => {
    if (!data) return [];

    const rows: { field: string; lh: any; rh: any; differential: string }[] = [];
    const processedFields = new Set<string>();

    // Fields to skip (non-measurement fields)
    const skipFields = [
      'hasBeenAdjusted',
      'combinedWith',
      'matingPart',
      'slideMotorMounts',
      'powerCordHoses',
      'chainsGearsSprockets',
      'lockingClamps',
      'notes',
    ];

    Object.keys(data).forEach((key) => {
      // Skip ID and timestamp fields
      if (isIdField(key)) {
        return;
      }

      // Skip non-measurement fields
      if (skipFields.includes(key)) {
        return;
      }

      // Extract field name without _RH or _LH suffix
      const baseField = key.replace(/_RH$|_LH$/, '');

      if (!processedFields.has(baseField)) {
        processedFields.add(baseField);
        const lhValue = data[`${baseField}_LH`];
        const rhValue = data[`${baseField}_RH`];

        // Calculate differential
        let differential = '-';
        if (typeof lhValue === 'number' && typeof rhValue === 'number') {
          differential = String(Math.abs(rhValue - lhValue));
        }

        rows.push({
          field: translateFieldName(baseField, sectionKey),
          lh: lhValue,
          rh: rhValue,
          differential,
        });
      }
    });

    return rows;
  };

  // Helper function to check if data has actual values (not just defaults)
  const hasActualData = (data: any): boolean => {
    if (!data) return false;

    // Check if any field has a value (including zero, which is valid)
    return Object.entries(data).some(([key, value]) => {
      if (key === 'hasBeenAdjusted' || key === 'combinedWith' || key === 'matingPart') {
        // Check if these string fields have non-empty values
        return value !== '' && value !== null && value !== undefined;
      }
      // For numeric fields, check if they exist (0 is a valid value)
      return typeof value === 'number' && !isNaN(value);
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

              // Render Bearing Clearance Section
              if (sectionKey === 'BEARING_CLEARANCE') {
                const data = completedSectionData[sectionKey];

                // Check if we have before data
                const hasBeforeData =
                  (data?.outerBefore && hasActualData(data.outerBefore)) ||
                  (data?.innerBefore && hasActualData(data.innerBefore));
                const hasAfterData =
                  (data?.outerData && hasActualData(data.outerData)) ||
                  (data?.innerData && hasActualData(data.innerData));

                const outerBeforeRows = extractBearingRows(data?.outerBefore, 'BEARING_CLEARANCE');
                const innerBeforeRows = extractBearingRows(data?.innerBefore, 'BEARING_CLEARANCE');
                const outerAfterRows = extractBearingRows(data?.outerData, 'BEARING_CLEARANCE');
                const innerAfterRows = extractBearingRows(data?.innerData, 'BEARING_CLEARANCE');

                return (
                  <Collapsible key={sectionKey} defaultOpen={true}>
                    <div className="border rounded-lg">
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors group">
                        <div className="flex items-center gap-2">
                          <Typography variant="h4" className="font-semibold text-sm">
                            {t('sectionNames.bearingClearance')}
                          </Typography>
                          <span className="text-xs text-green-600 dark:text-green-400">
                            ({tServices('modal.status.complete')})
                          </span>
                        </div>
                        <ChevronUp className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-3 pt-0 text-xs">
                        {/* Before Measurements (only if data exists) */}
                        {hasBeforeData && (
                          <div className="border-t pt-2 mb-3">
                            <div className="font-semibold text-muted-foreground mb-2 text-sm">
                              {tServices('modal.sections.beforeMaintenance')}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              {/* Outer Table */}
                              <div className="border rounded-md overflow-hidden">
                                <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                                  {tTable('outer')}
                                </div>
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-muted/50">
                                      <TableHead className="h-8 text-[10px] font-semibold border-r">
                                        {tTable('field')}
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                        {tTable('lh')}
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                        {tTable('rh')}
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold">
                                        {tTable('diff')}
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {outerBeforeRows.map((row, idx) => (
                                      <TableRow key={idx} className="text-[11px] hover:bg-muted/30">
                                        <TableCell className="py-1.5 font-medium border-r bg-muted/20">
                                          {row.field}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center border-r">
                                          {displayValue(row.lh)}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center border-r">
                                          {displayValue(row.rh)}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center">
                                          {row.differential}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>

                              {/* Inner Table */}
                              <div className="border rounded-md overflow-hidden">
                                <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                                  {tTable('inner')}
                                </div>
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-muted/50">
                                      <TableHead className="h-8 text-[10px] font-semibold border-r">
                                        {tTable('field')}
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                        {tTable('lh')}
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                        {tTable('rh')}
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold">
                                        {tTable('diff')}
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {innerBeforeRows.map((row, idx) => (
                                      <TableRow key={idx} className="text-[11px] hover:bg-muted/30">
                                        <TableCell className="py-1.5 font-medium border-r bg-muted/20">
                                          {row.field}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center border-r">
                                          {displayValue(row.lh)}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center border-r">
                                          {displayValue(row.rh)}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center">
                                          {row.differential}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* After Measurements */}
                        {hasAfterData && (
                          <div className="border-t pt-2">
                            {hasBeforeData && (
                              <div className="font-semibold text-muted-foreground mb-2 text-sm">
                                {tServices('modal.sections.afterMaintenance')}
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-3">
                              {/* Outer Table */}
                              <div className="border rounded-md overflow-hidden">
                                <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                                  {tTable('outer')}
                                </div>
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-muted/50">
                                      <TableHead className="h-8 text-[10px] font-semibold border-r">
                                        {tTable('field')}
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                        {tTable('lh')}
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                        {tTable('rh')}
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold">
                                        {tTable('diff')}
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {outerAfterRows.map((row, idx) => (
                                      <TableRow key={idx} className="text-[11px] hover:bg-muted/30">
                                        <TableCell className="py-1.5 font-medium border-r bg-muted/20">
                                          {row.field}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center border-r">
                                          {displayValue(row.lh)}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center border-r">
                                          {displayValue(row.rh)}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center">
                                          {row.differential}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>

                              {/* Inner Table */}
                              <div className="border rounded-md overflow-hidden">
                                <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                                  {tTable('inner')}
                                </div>
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-muted/50">
                                      <TableHead className="h-8 text-[10px] font-semibold border-r">
                                        {tTable('field')}
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                        {tTable('lh')}
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                        {tTable('rh')}
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold">
                                        {tTable('diff')}
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {innerAfterRows.map((row, idx) => (
                                      <TableRow key={idx} className="text-[11px] hover:bg-muted/30">
                                        <TableCell className="py-1.5 font-medium border-r bg-muted/20">
                                          {row.field}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center border-r">
                                          {displayValue(row.lh)}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center border-r">
                                          {displayValue(row.rh)}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center">
                                          {row.differential}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Additional Fields */}
                        {(hasBeforeData || hasAfterData) && (
                          <div className="border-t pt-2 mt-3">
                            <div className="font-semibold text-muted-foreground mb-2 text-sm">
                              {tServicesSummary('additionalInformation')}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              {/* Outer Fields */}
                              <div className="border rounded-md overflow-hidden">
                                <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                                  {tTable('outer')}
                                </div>
                                <div className="p-2 space-y-1.5 text-[11px]">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      {tBearingFields('combinedWith')}:
                                    </span>
                                    <span className="font-medium">
                                      {displayValue(
                                        data?.outerData?.combinedWith ||
                                          data?.outerBefore?.combinedWith,
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      {tBearingFields('matingPart')}:
                                    </span>
                                    <span className="font-medium">
                                      {displayValue(
                                        data?.outerData?.matingPart ||
                                          data?.outerBefore?.matingPart,
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      {tBearingFields('hasBeenAdjusted')}:
                                    </span>
                                    <span className="font-medium">
                                      {displayValue(
                                        data?.outerData?.hasBeenAdjusted ||
                                          data?.outerBefore?.hasBeenAdjusted,
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Inner Fields */}
                              <div className="border rounded-md overflow-hidden">
                                <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                                  {tTable('inner')}
                                </div>
                                <div className="p-2 space-y-1.5 text-[11px]">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      {tBearingFields('combinedWith')}:
                                    </span>
                                    <span className="font-medium">
                                      {displayValue(
                                        data?.innerData?.combinedWith ||
                                          data?.innerBefore?.combinedWith,
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      {tBearingFields('matingPart')}:
                                    </span>
                                    <span className="font-medium">
                                      {displayValue(
                                        data?.innerData?.matingPart ||
                                          data?.innerBefore?.matingPart,
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      {tBearingFields('hasBeenAdjusted')}:
                                    </span>
                                    <span className="font-medium">
                                      {displayValue(
                                        data?.innerData?.hasBeenAdjusted ||
                                          data?.innerBefore?.hasBeenAdjusted,
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Shutdown Adjustment Mechanism */}
                            <div className="mt-3">
                              <div className="font-semibold text-muted-foreground mb-2 text-xs">
                                {tServicesSummary('shutdownAdjustmentMechanism')}
                              </div>
                              <div className="border rounded-md overflow-hidden">
                                <div className="p-2 space-y-1.5 text-[11px]">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      {tBearingFields('slideMotorMounts')}:
                                    </span>
                                    <span className="font-medium">
                                      {displayValue(
                                        data?.outerData?.slideMotorMounts ||
                                          data?.outerBefore?.slideMotorMounts,
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      {tBearingFields('powerCordHoses')}:
                                    </span>
                                    <span className="font-medium">
                                      {displayValue(
                                        data?.outerData?.powerCordHoses ||
                                          data?.outerBefore?.powerCordHoses,
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      {tBearingFields('chainsGearsSprockets')}:
                                    </span>
                                    <span className="font-medium">
                                      {displayValue(
                                        data?.outerData?.chainsGearsSprockets ||
                                          data?.outerBefore?.chainsGearsSprockets,
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      {tBearingFields('lockingClamps')}:
                                    </span>
                                    <span className="font-medium">
                                      {displayValue(
                                        data?.outerData?.lockingClamps ||
                                          data?.outerBefore?.lockingClamps,
                                      )}
                                    </span>
                                  </div>
                                  {(data?.outerData?.notes || data?.outerBefore?.notes) && (
                                    <div className="flex flex-col gap-1 pt-1 border-t">
                                      <span className="text-muted-foreground">
                                        {tServicesSummary('notes')}:
                                      </span>
                                      <span className="font-medium">
                                        {displayValue(
                                          data?.outerData?.notes || data?.outerBefore?.notes,
                                        )}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              }

              // Render Slide Section
              if (sectionKey === 'SLIDE') {
                const data = completedSectionData[sectionKey] || {};

                return (
                  <Collapsible key={sectionKey} defaultOpen={true}>
                    <div className="border rounded-lg">
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors group">
                        <div className="flex items-center gap-2">
                          <Typography variant="h4" className="font-semibold text-sm">
                            {t('sectionNames.slide')}
                          </Typography>
                          <span className="text-xs text-green-600 dark:text-green-400">
                            ({tServices('modal.status.complete')})
                          </span>
                        </div>
                        <ChevronUp className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-3 pt-0 text-xs">
                        {/* Section-level fields table - Only specific fields */}
                        {Object.entries(data).filter(
                          ([key, value]) =>
                            !isIdField(key) &&
                            isSlideFieldAllowedInSummary(key) &&
                            key !== 'outerData' &&
                            key !== 'innerData' &&
                            key !== 'outerBefore' &&
                            key !== 'innerBefore' &&
                            (typeof value !== 'object' || value === null) &&
                            value !== null &&
                            value !== undefined &&
                            value !== '',
                        ).length > 0 && (
                          <div className="border-t pt-2">
                            <div className="font-medium text-muted-foreground mb-2 text-[11px]">
                              {tServicesSummary('sectionFields')}
                            </div>
                            <div className="border rounded-md overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-muted/50">
                                    <TableHead className="h-8 text-[10px] font-semibold border-r">
                                      {tTable('field')}
                                    </TableHead>
                                    <TableHead className="h-8 text-[10px] text-center font-semibold">
                                      {tTable('value')}
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {Object.entries(data)
                                    .filter(
                                      ([key, value]) =>
                                        !isIdField(key) &&
                                        isSlideFieldAllowedInSummary(key) &&
                                        key !== 'outerData' &&
                                        key !== 'innerData' &&
                                        key !== 'outerBefore' &&
                                        key !== 'innerBefore' &&
                                        (typeof value !== 'object' || value === null) &&
                                        value !== null &&
                                        value !== undefined &&
                                        value !== '',
                                    )
                                    .map(([key, value]) => (
                                      <TableRow key={key} className="text-[11px] hover:bg-muted/30">
                                        <TableCell className="py-1.5 font-medium border-r bg-muted/20">
                                          {translateFieldName(key, 'SLIDE')}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center">
                                          {displayValue(value)}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        )}

                        {/* Outer Before Measurements */}
                        {data.outerBefore && (
                          <div className="border-t pt-3 mt-3">
                            <div className="font-medium text-muted-foreground mb-2 text-[11px]">
                              {tMeasurements('outerBeforeMaintenance')}
                            </div>
                            <div className="border rounded-md overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-muted/50">
                                    <TableHead className="h-8 text-[10px] font-semibold text-center">
                                      Pos 1
                                    </TableHead>
                                    <TableHead className="h-8 text-[10px] font-semibold text-center">
                                      Pos 2
                                    </TableHead>
                                    <TableHead className="h-8 text-[10px] font-semibold text-center">
                                      Pos 3
                                    </TableHead>
                                    <TableHead className="h-8 text-[10px] font-semibold text-center">
                                      Pos 4
                                    </TableHead>
                                    <TableHead className="h-8 text-[10px] font-semibold text-center">
                                      Pos 5
                                    </TableHead>
                                    <TableHead className="h-8 text-[10px] font-semibold text-center">
                                      Pos 6
                                    </TableHead>
                                    <TableHead className="h-8 text-[10px] font-semibold text-center bg-blue-50 dark:bg-blue-950">
                                      {tSlide('maxDeviation')}
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  <TableRow className="text-[11px]">
                                    <TableCell className="py-1.5 text-center">
                                      {displayValue(data.outerBefore.position1)}
                                    </TableCell>
                                    <TableCell className="py-1.5 text-center">
                                      {displayValue(data.outerBefore.position2)}
                                    </TableCell>
                                    <TableCell className="py-1.5 text-center">
                                      {displayValue(data.outerBefore.position3)}
                                    </TableCell>
                                    <TableCell className="py-1.5 text-center">
                                      {displayValue(data.outerBefore.position4)}
                                    </TableCell>
                                    <TableCell className="py-1.5 text-center">
                                      {displayValue(data.outerBefore.position5)}
                                    </TableCell>
                                    <TableCell className="py-1.5 text-center">
                                      {displayValue(data.outerBefore.position6)}
                                    </TableCell>
                                    <TableCell className="py-1.5 text-center font-semibold bg-blue-50 dark:bg-blue-950">
                                      {calculateMaxDeviation(data.outerBefore)}
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        )}

                        {/* Outer After Measurements */}
                        {data.outerData && (
                          <div className="border-t pt-3 mt-3">
                            <div className="font-medium text-muted-foreground mb-2 text-[11px]">
                              {data.outerBefore
                                ? tMeasurements('outerAfterMaintenance')
                                : tMeasurements('outerMeasurements')}
                            </div>
                            <div className="border rounded-md overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-muted/50">
                                    <TableHead className="h-8 text-[10px] font-semibold text-center">
                                      Pos 1
                                    </TableHead>
                                    <TableHead className="h-8 text-[10px] font-semibold text-center">
                                      Pos 2
                                    </TableHead>
                                    <TableHead className="h-8 text-[10px] font-semibold text-center">
                                      Pos 3
                                    </TableHead>
                                    <TableHead className="h-8 text-[10px] font-semibold text-center">
                                      Pos 4
                                    </TableHead>
                                    <TableHead className="h-8 text-[10px] font-semibold text-center">
                                      Pos 5
                                    </TableHead>
                                    <TableHead className="h-8 text-[10px] font-semibold text-center">
                                      Pos 6
                                    </TableHead>
                                    <TableHead className="h-8 text-[10px] font-semibold text-center bg-blue-50 dark:bg-blue-950">
                                      {tSlide('maxDeviation')}
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  <TableRow className="text-[11px]">
                                    <TableCell className="py-1.5 text-center">
                                      {displayValue(data.outerData.position1)}
                                    </TableCell>
                                    <TableCell className="py-1.5 text-center">
                                      {displayValue(data.outerData.position2)}
                                    </TableCell>
                                    <TableCell className="py-1.5 text-center">
                                      {displayValue(data.outerData.position3)}
                                    </TableCell>
                                    <TableCell className="py-1.5 text-center">
                                      {displayValue(data.outerData.position4)}
                                    </TableCell>
                                    <TableCell className="py-1.5 text-center">
                                      {displayValue(data.outerData.position5)}
                                    </TableCell>
                                    <TableCell className="py-1.5 text-center">
                                      {displayValue(data.outerData.position6)}
                                    </TableCell>
                                    <TableCell className="py-1.5 text-center font-semibold bg-blue-50 dark:bg-blue-950">
                                      {calculateMaxDeviation(data.outerData)}
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        )}

                        {/* Inner Before Measurements */}
                        {data.innerBefore && (
                          <div className="border-t pt-3 mt-3">
                            <div className="font-medium text-muted-foreground mb-2 text-[11px]">
                              {tMeasurements('innerBeforeMaintenance')}
                            </div>
                            <div className="border rounded-md overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-muted/50">
                                    <TableHead className="h-8 text-[10px] font-semibold text-center">
                                      Pos 1
                                    </TableHead>
                                    <TableHead className="h-8 text-[10px] font-semibold text-center">
                                      Pos 2
                                    </TableHead>
                                    <TableHead className="h-8 text-[10px] font-semibold text-center">
                                      Pos 3
                                    </TableHead>
                                    <TableHead className="h-8 text-[10px] font-semibold text-center">
                                      Pos 4
                                    </TableHead>
                                    <TableHead className="h-8 text-[10px] font-semibold text-center">
                                      Pos 5
                                    </TableHead>
                                    <TableHead className="h-8 text-[10px] font-semibold text-center">
                                      Pos 6
                                    </TableHead>
                                    <TableHead className="h-8 text-[10px] font-semibold text-center bg-blue-50 dark:bg-blue-950">
                                      {tSlide('maxDeviation')}
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  <TableRow className="text-[11px]">
                                    <TableCell className="py-1.5 text-center">
                                      {displayValue(data.innerBefore.position1)}
                                    </TableCell>
                                    <TableCell className="py-1.5 text-center">
                                      {displayValue(data.innerBefore.position2)}
                                    </TableCell>
                                    <TableCell className="py-1.5 text-center">
                                      {displayValue(data.innerBefore.position3)}
                                    </TableCell>
                                    <TableCell className="py-1.5 text-center">
                                      {displayValue(data.innerBefore.position4)}
                                    </TableCell>
                                    <TableCell className="py-1.5 text-center">
                                      {displayValue(data.innerBefore.position5)}
                                    </TableCell>
                                    <TableCell className="py-1.5 text-center">
                                      {displayValue(data.innerBefore.position6)}
                                    </TableCell>
                                    <TableCell className="py-1.5 text-center font-semibold bg-blue-50 dark:bg-blue-950">
                                      {calculateMaxDeviation(data.innerBefore)}
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        )}

                        {/* Inner After Measurements */}
                        {data.innerData && (
                          <div className="border-t pt-3 mt-3">
                            <div className="font-medium text-muted-foreground mb-2 text-[11px]">
                              {data.innerBefore
                                ? tMeasurements('innerAfterMaintenance')
                                : tMeasurements('innerMeasurements')}
                            </div>
                            <div className="border rounded-md overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-muted/50">
                                    <TableHead className="h-8 text-[10px] font-semibold text-center">
                                      Pos 1
                                    </TableHead>
                                    <TableHead className="h-8 text-[10px] font-semibold text-center">
                                      Pos 2
                                    </TableHead>
                                    <TableHead className="h-8 text-[10px] font-semibold text-center">
                                      Pos 3
                                    </TableHead>
                                    <TableHead className="h-8 text-[10px] font-semibold text-center">
                                      Pos 4
                                    </TableHead>
                                    <TableHead className="h-8 text-[10px] font-semibold text-center">
                                      Pos 5
                                    </TableHead>
                                    <TableHead className="h-8 text-[10px] font-semibold text-center">
                                      Pos 6
                                    </TableHead>
                                    <TableHead className="h-8 text-[10px] font-semibold text-center bg-blue-50 dark:bg-blue-950">
                                      {tSlide('maxDeviation')}
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  <TableRow className="text-[11px]">
                                    <TableCell className="py-1.5 text-center">
                                      {displayValue(data.innerData.position1)}
                                    </TableCell>
                                    <TableCell className="py-1.5 text-center">
                                      {displayValue(data.innerData.position2)}
                                    </TableCell>
                                    <TableCell className="py-1.5 text-center">
                                      {displayValue(data.innerData.position3)}
                                    </TableCell>
                                    <TableCell className="py-1.5 text-center">
                                      {displayValue(data.innerData.position4)}
                                    </TableCell>
                                    <TableCell className="py-1.5 text-center">
                                      {displayValue(data.innerData.position5)}
                                    </TableCell>
                                    <TableCell className="py-1.5 text-center">
                                      {displayValue(data.innerData.position6)}
                                    </TableCell>
                                    <TableCell className="py-1.5 text-center font-semibold bg-blue-50 dark:bg-blue-950">
                                      {calculateMaxDeviation(data.innerData)}
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        )}
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              }

              // Render Gibs Section (similar to Bearing Clearance)
              if (sectionKey === 'GIBS') {
                const data = completedSectionData[sectionKey];

                // Check if we have before data
                const hasBeforeData =
                  (data?.outerBefore && hasActualData(data.outerBefore)) ||
                  (data?.innerBefore && hasActualData(data.innerBefore));
                const hasAfterData =
                  (data?.outerData && hasActualData(data.outerData)) ||
                  (data?.innerData && hasActualData(data.innerData));

                const outerBeforeRows = extractBearingRows(data?.outerBefore, 'GIBS');
                const innerBeforeRows = extractBearingRows(data?.innerBefore, 'GIBS');
                const outerDataRows = extractBearingRows(data?.outerData, 'GIBS');
                const innerDataRows = extractBearingRows(data?.innerData, 'GIBS');

                return (
                  <Collapsible key={sectionKey} defaultOpen={true}>
                    <div className="border rounded-lg">
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors group">
                        <div className="flex items-center gap-2">
                          <Typography variant="h4" className="font-semibold text-sm">
                            {t('sectionNames.gibs')}
                          </Typography>
                          <span className="text-xs text-green-600 dark:text-green-400">
                            ({tServices('modal.status.complete')})
                          </span>
                        </div>
                        <ChevronUp className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-3 pt-0 text-xs">
                        {/* Before Measurements (only if data exists) */}
                        {hasBeforeData && (
                          <div className="border-t pt-2 mb-3">
                            <div className="font-semibold text-muted-foreground mb-2 text-sm">
                              {tServices('modal.sections.beforeMaintenance')}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              {/* Outer Table */}
                              <div className="border rounded-md overflow-hidden">
                                <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                                  {tTable('outer')}
                                </div>
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-muted/50">
                                      <TableHead className="h-8 text-[10px] font-semibold border-r">
                                        {tTable('field')}
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                        {tTable('lh')}
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                        {tTable('rh')}
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold">
                                        {tTable('diff')}
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {outerBeforeRows.map((row, idx) => (
                                      <TableRow key={idx} className="text-[11px] hover:bg-muted/30">
                                        <TableCell className="py-1.5 font-medium border-r bg-muted/20">
                                          {row.field}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center border-r">
                                          {displayValue(row.lh)}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center border-r">
                                          {displayValue(row.rh)}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center">
                                          {row.differential}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>

                              {/* Inner Table */}
                              <div className="border rounded-md overflow-hidden">
                                <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                                  {tTable('inner')}
                                </div>
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-muted/50">
                                      <TableHead className="h-8 text-[10px] font-semibold border-r">
                                        {tTable('field')}
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                        {tTable('lh')}
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                        {tTable('rh')}
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold">
                                        {tTable('diff')}
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {innerBeforeRows.map((row, idx) => (
                                      <TableRow key={idx} className="text-[11px] hover:bg-muted/30">
                                        <TableCell className="py-1.5 font-medium border-r bg-muted/20">
                                          {row.field}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center border-r">
                                          {displayValue(row.lh)}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center border-r">
                                          {displayValue(row.rh)}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center">
                                          {row.differential}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Data Measurements */}
                        {hasAfterData && (
                          <div className="border-t pt-2">
                            {hasBeforeData && (
                              <div className="font-semibold text-muted-foreground mb-2 text-sm">
                                {tServicesSummary('dataMeasurements')}
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-3">
                              {/* Outer Table */}
                              <div className="border rounded-md overflow-hidden">
                                <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                                  {tTable('outer')}
                                </div>
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-muted/50">
                                      <TableHead className="h-8 text-[10px] font-semibold border-r">
                                        {tTable('field')}
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                        {tTable('lh')}
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                        {tTable('rh')}
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold">
                                        {tTable('diff')}
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {outerDataRows.map((row, idx) => (
                                      <TableRow key={idx} className="text-[11px] hover:bg-muted/30">
                                        <TableCell className="py-1.5 font-medium border-r bg-muted/20">
                                          {row.field}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center border-r">
                                          {displayValue(row.lh)}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center border-r">
                                          {displayValue(row.rh)}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center">
                                          {row.differential}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>

                              {/* Inner Table */}
                              <div className="border rounded-md overflow-hidden">
                                <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                                  {tTable('inner')}
                                </div>
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-muted/50">
                                      <TableHead className="h-8 text-[10px] font-semibold border-r">
                                        {tTable('field')}
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                        {tTable('lh')}
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                        {tTable('rh')}
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold">
                                        {tTable('diff')}
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {innerDataRows.map((row, idx) => (
                                      <TableRow key={idx} className="text-[11px] hover:bg-muted/30">
                                        <TableCell className="py-1.5 font-medium border-r bg-muted/20">
                                          {row.field}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center border-r">
                                          {displayValue(row.lh)}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center border-r">
                                          {displayValue(row.rh)}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-center">
                                          {row.differential}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          </div>
                        )}
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              }

              // Render Counterbalance Cylinder/Airbag Section (similar to Bearing Clearance)
              if (sectionKey === 'COUNTERBALANCE_CYLINDER_AIRBAG') {
                const data = completedSectionData[sectionKey];

                return (
                  <Collapsible key={sectionKey} defaultOpen={true}>
                    <div className="border rounded-lg">
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors group">
                        <div className="flex items-center gap-2">
                          <Typography variant="h4" className="font-semibold text-sm">
                            {t('sectionNames.counterbalance')}
                          </Typography>
                          <span className="text-xs text-green-600 dark:text-green-400">
                            ({tServices('modal.status.complete')})
                          </span>
                        </div>
                        <ChevronUp className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-3 pt-0 text-xs">
                        <div className="border-t pt-2">
                          <div className="grid grid-cols-2 gap-3">
                            {data?.outerData && (
                              <div className="border rounded-md overflow-hidden">
                                <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                                  {tTable('outer')}
                                </div>
                                <div className="p-2 space-y-1.5 text-[11px]">
                                  {Object.entries(data.outerData)
                                    .filter(([key]) => !isIdField(key) && key !== 'notes')
                                    .map(([key, value]) => (
                                      <div key={key} className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          {translateFieldName(
                                            key,
                                            'COUNTERBALANCE_CYLINDER_AIRBAG',
                                          )}
                                          :
                                        </span>
                                        <span className="font-medium">{displayValue(value)}</span>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}

                            {data?.innerData && (
                              <div className="border rounded-md overflow-hidden">
                                <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                                  {tTable('inner')}
                                </div>
                                <div className="p-2 space-y-1.5 text-[11px]">
                                  {Object.entries(data.innerData)
                                    .filter(([key]) => !isIdField(key) && key !== 'notes')
                                    .map(([key, value]) => (
                                      <div key={key} className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          {translateFieldName(
                                            key,
                                            'COUNTERBALANCE_CYLINDER_AIRBAG',
                                          )}
                                          :
                                        </span>
                                        <span className="font-medium">{displayValue(value)}</span>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Notes (if exists) */}
                          {(data?.outerData?.notes || data?.innerData?.notes) && (
                            <div className="mt-3 border-t pt-2">
                              <div className="font-semibold text-muted-foreground mb-2 text-xs">
                                {tServicesSummary('notes')}
                              </div>
                              <div className="border rounded-md overflow-hidden">
                                <div className="p-2 text-[11px]">
                                  <span className="font-medium">
                                    {displayValue(data?.outerData?.notes || data?.innerData?.notes)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              }

              // Render Tramming Section
              if (sectionKey === 'TRAMMING') {
                const data = completedSectionData[sectionKey];

                return (
                  <Collapsible key={sectionKey} defaultOpen={true}>
                    <div className="border rounded-lg">
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors group">
                        <div className="flex items-center gap-2">
                          <Typography variant="h4" className="font-semibold text-sm">
                            {t('sectionNames.tramming')}
                          </Typography>
                          <span className="text-xs text-green-600 dark:text-green-400">
                            ({tServices('modal.status.complete')})
                          </span>
                        </div>
                        <ChevronUp className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-3 pt-0 text-xs">
                        <div className="border-t pt-2 space-y-4">
                          {/* Slide Tram and Unit Fields */}
                          <div className="border rounded-md overflow-hidden">
                            <div className="p-2 space-y-1.5 text-[11px]">
                              {data?.slideTram && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Slide Tram:</span>
                                  <span className="font-medium">{displayValue(data.slideTram)}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Unit:</span>
                                <span className="font-medium">{data?.unit || 'inches'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Render actual tramming forms in read-only mode */}
                          <Tabs defaultValue="outer" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                              <TabsTrigger value="outer">Outer Measurements</TabsTrigger>
                              <TabsTrigger value="inner">Inner Measurements</TabsTrigger>
                            </TabsList>

                            {data?.outerData && (
                              <TabsContent value="outer">
                                <TrammingForm
                                  data={data.outerData}
                                  errors={{}}
                                  updateField={() => {}}
                                  handleBlur={() => {}}
                                  title="Outer"
                                  readOnly={true}
                                />
                              </TabsContent>
                            )}

                            {data?.innerData && (
                              <TabsContent value="inner">
                                <TrammingForm
                                  data={data.innerData}
                                  errors={{}}
                                  updateField={() => {}}
                                  handleBlur={() => {}}
                                  title="Inner"
                                  readOnly={true}
                                />
                              </TabsContent>
                            )}
                          </Tabs>

                          {/* Notes */}
                          {data?.notes && (
                            <div className="border-t pt-2">
                              <div className="font-semibold text-muted-foreground mb-2 text-xs">
                                {tServicesSummary('notes')}
                              </div>
                              <div className="border rounded-md overflow-hidden">
                                <div className="p-2 text-[11px]">
                                  <span className="font-medium">{displayValue(data.notes)}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              }

              // Render Clutch Section with organized groups
              if (sectionKey === 'CLUTCH') {
                const data = completedSectionData[sectionKey] || {};

                // Helper to render a field group
                const renderFieldGroup = (
                  title: string,
                  fields: Array<{ key: string; label?: string; combine?: boolean }>,
                ) => {
                  const visibleFields = fields
                    .map((field) => {
                      // Handle combined pressure fields
                      if (field.combine && field.key.endsWith('Value')) {
                        const baseKey = field.key.replace('Value', '');
                        const value = data[field.key];
                        const unit = data[`${baseKey}Unit`];
                        if (value !== null && value !== undefined && value !== '') {
                          return {
                            key: field.key,
                            label: field.label || formatFieldName(baseKey),
                            value: `${value} ${unit || 'PSI'}`,
                          };
                        }
                        return null;
                      }
                      // Handle regular fields
                      const value = data[field.key];
                      if (value !== null && value !== undefined && value !== '') {
                        return {
                          key: field.key,
                          label: field.label || formatFieldName(field.key),
                          value: displayValue(value),
                        };
                      }
                      return null;
                    })
                    .filter(Boolean);

                  if (visibleFields.length === 0) return null;

                  return (
                    <div className="border rounded-md overflow-hidden">
                      <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold border-b">
                        {title}
                      </div>
                      <div className="p-2 space-y-1.5 text-[11px]">
                        {visibleFields.map((field) => (
                          <div key={field!.key} className="flex justify-between gap-2">
                            <span className="text-muted-foreground">{field!.label}:</span>
                            <span className="font-medium text-right">{field!.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                };

                const hasAnyData = Object.values(data).some(
                  (val) => val !== null && val !== undefined && val !== '',
                );

                if (!hasAnyData) return null;

                return (
                  <Collapsible key={sectionKey} defaultOpen={true}>
                    <div className="border rounded-lg">
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors">
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
                        <div className="border-t pt-2">
                          {/* Basic Info */}
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            {renderFieldGroup('Basic Information', [
                              { key: 'clutchType' },
                              { key: 'clutchLocation' },
                            ])}
                          </div>

                          {/* Brake Spring Settings */}
                          <div className="mb-3">
                            {renderFieldGroup('Brake Spring Settings (inches)', [
                              { key: 'brakeSpringBrake', label: 'Brake' },
                              { key: 'brakeSpringClutch', label: 'Clutch' },
                              { key: 'brakeSpringFB', label: 'FB' },
                              { key: 'brakeSpringFTB', label: 'FTB' },
                              { key: 'brakeSpringRTB', label: 'RTB' },
                              { key: 'brakeSpringStudBolt', label: 'Stud Bolt' },
                            ])}
                          </div>

                          {/* Brake Measurements */}
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            {renderFieldGroup('Brake Measurements', [
                              { key: 'brakeStoppingTime' },
                              { key: 'brakeLining' },
                              { key: 'brakeClearing' },
                              { key: 'brakeClearanceTotal' },
                              { key: 'brakeClearanceRear' },
                            ])}

                            {renderFieldGroup('Flywheel', [
                              { key: 'flywheelStoppingTime' },
                              { key: 'flywheelBearings' },
                              { key: 'flywheelBrake' },
                            ])}
                          </div>

                          {/* Clutch & Seals */}
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            {renderFieldGroup('Clutch & Seals', [
                              { key: 'rotaryUnion' },
                              { key: 'clutchEngagements' },
                              { key: 'clutchLining' },
                              { key: 'clutchSeals' },
                              { key: 'separateBrakeSeals' },
                              { key: 'flexDisc' },
                            ])}

                            {renderFieldGroup('Adjustments', [
                              { key: 'splinesDriveRingDisc' },
                              { key: 'adjustingNutLockSecure' },
                            ])}
                          </div>

                          {/* Measurements - Before/After */}
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            {renderFieldGroup('Gear Backlash', [
                              { key: 'gearBacklashBefore', label: 'Before' },
                              { key: 'gearBacklashAfter', label: 'After' },
                            ])}

                            {renderFieldGroup('Crank Endplay', [
                              { key: 'crankEndplayBefore', label: 'Before' },
                              { key: 'crankEndplayAfter', label: 'After' },
                            ])}
                          </div>

                          {/* Air System */}
                          <div className="mb-3">
                            {renderFieldGroup('Air System', [
                              { key: 'airRegulatorValue', combine: true },
                              { key: 'airClutchTravel' },
                              { key: 'airLineOilerSetting' },
                            ])}
                          </div>

                          {/* Hydraulic System */}
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            {renderFieldGroup('Hydraulic System', [
                              { key: 'hydClutchClearanceTotal' },
                              { key: 'hydClutchClearanceRear' },
                              { key: 'hydraulicPressureValue', combine: true },
                              { key: 'accumulatorValue', combine: true },
                            ])}
                          </div>

                          {/* Notes */}
                          {data.notes && (
                            <div className="border-t pt-2 mt-3">
                              <div className="font-semibold text-muted-foreground mb-2 text-xs">
                                {tServicesSummary('notes')}
                              </div>
                              <div className="border rounded-md overflow-hidden">
                                <div className="p-2 text-[11px]">
                                  <span className="font-medium">{displayValue(data.notes)}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              }

              // For other sections (LUBRICATION_HYDRAULICS), render a simple table
              const data = completedSectionData[sectionKey] || {};

              // Filter out object/array fields and ID fields (we'll handle gauges separately for lubrication)
              const scalarFields = Object.entries(data).filter(
                ([key, value]) =>
                  !isIdField(key) &&
                  key !== 'gauges' &&
                  (typeof value !== 'object' || value === null) &&
                  value !== null &&
                  value !== undefined &&
                  value !== '',
              );

              const gauges =
                sectionKey === 'LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER' &&
                Array.isArray(data.gauges)
                  ? data.gauges
                  : [];

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
                      {/* Scalar fields table */}
                      {scalarFields.length > 0 && (
                        <div className="border-t pt-2 mb-3">
                          <div className="border rounded-md overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-muted/50">
                                  <TableHead className="h-8 text-[10px] font-semibold border-r">
                                    {tTable('field')}
                                  </TableHead>
                                  <TableHead className="h-8 text-[10px] text-center font-semibold">
                                    {tTable('value')}
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {scalarFields.map(([key, value]) => (
                                  <TableRow key={key} className="text-[11px] hover:bg-muted/30">
                                    <TableCell className="py-1.5 font-medium border-r bg-muted/20">
                                      {translateFieldName(
                                        key,
                                        'LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER',
                                      )}
                                    </TableCell>
                                    <TableCell className="py-1.5 text-center">
                                      {displayValue(value)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )}

                      {/* Gauges table for lubrication/hydraulics */}
                      {gauges.length > 0 && (
                        <div className="border-t pt-2">
                          <div className="font-medium text-muted-foreground mb-2 text-[11px]">
                            {tServicesSummary('gauges')}
                          </div>
                          <div className="border rounded-md overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-muted/50">
                                  <TableHead className="h-8 text-[10px] font-semibold border-r">
                                    {tTable('system')}
                                  </TableHead>
                                  <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                    {tTable('gauge')}
                                  </TableHead>
                                  <TableHead className="h-8 text-[10px] text-center font-semibold">
                                    {tTable('psi')}
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {gauges.map((gauge: any, idx: number) => (
                                  <TableRow key={idx} className="text-[11px] hover:bg-muted/30">
                                    <TableCell className="py-1.5 font-medium border-r bg-muted/20">
                                      {displayValue(gauge.system)}
                                    </TableCell>
                                    <TableCell className="py-1.5 text-center border-r">
                                      {displayValue(gauge.gauge)}
                                    </TableCell>
                                    <TableCell className="py-1.5 text-center">
                                      {displayValue(gauge.psi)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )}

                      {/* Show message if no data to display */}
                      {scalarFields.length === 0 && gauges.length === 0 && (
                        <div className="border-t pt-2">
                          <Typography variant="muted" className="text-center py-4 text-xs">
                            Nenhum dado disponível
                          </Typography>
                        </div>
                      )}
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
