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
import { Check, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ServiceType, type Service } from '@/data/types/services.types';
import { format } from 'date-fns';
import { SECTION_REGISTRY } from './sections/registry';

interface ServiceSummaryModalProps {
  service: Service;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ServiceSummaryModal({ service, open, onOpenChange }: ServiceSummaryModalProps) {
  const t = useTranslations('machines');
  const tServices = useTranslations('services');

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

        // For clutch and lubricationHydraulics, extract nested data object
        if (key === 'clutch' || key === 'lubricationHydraulics') {
          extractedData = extractedData.data || extractedData;
        }
      }

      // For inspections, show all sections even if empty
      // For maintenance, only show sections with actual data
      if (isInspection || hasDataContent(extractedData)) {
        completedSections.push(registryKey);
        completedSectionData[registryKey] = extractedData;
      }
    }
  });

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

  // Helper function to display value or "-" for empty
  const displayValue = (value: any): string => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return String(value);
  };

  // Helper function to extract bearing measurement rows
  const extractBearingRows = (data: any) => {
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
          field: formatFieldName(baseField),
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
            {isInspection
              ? tServices('modal.inspectionSummary')
              : tServices('modal.maintenanceSummary')}
          </DialogTitle>
          <DialogDescription>
            {isInspection ? 'Detalhes da inspeção realizada' : 'Detalhes da manutenção realizada'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {/* Service Details Summary */}
          <div className="border rounded-lg p-4 mb-4">
            <Typography variant="h4" className="font-semibold mb-3">
              Detalhes do Serviço
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
              Áreas Preenchidas
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
              Dados Preenchidos
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

                const outerBeforeRows = extractBearingRows(data?.outerBefore);
                const innerBeforeRows = extractBearingRows(data?.innerBefore);
                const outerAfterRows = extractBearingRows(data?.outerData);
                const innerAfterRows = extractBearingRows(data?.innerData);

                return (
                  <Collapsible key={sectionKey} defaultOpen={true}>
                    <div className="border rounded-lg">
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2">
                          <Typography variant="h4" className="font-semibold text-sm">
                            {t('sectionNames.bearingClearance')}
                          </Typography>
                          <span className="text-xs text-green-600 dark:text-green-400">
                            ({tServices('modal.status.complete')})
                          </span>
                        </div>
                        <ChevronUp className="w-4 h-4 transition-transform duration-200 data-[state=open]:rotate-180" />
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
                                  Outer
                                </div>
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-muted/50">
                                      <TableHead className="h-8 text-[10px] font-semibold border-r">
                                        Field
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                        LH
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                        RH
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold">
                                        Diff
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
                                  Inner
                                </div>
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-muted/50">
                                      <TableHead className="h-8 text-[10px] font-semibold border-r">
                                        Field
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                        LH
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                        RH
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold">
                                        Diff
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
                                  Outer
                                </div>
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-muted/50">
                                      <TableHead className="h-8 text-[10px] font-semibold border-r">
                                        Field
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                        LH
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                        RH
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold">
                                        Diff
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
                                  Inner
                                </div>
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-muted/50">
                                      <TableHead className="h-8 text-[10px] font-semibold border-r">
                                        Field
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                        LH
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                        RH
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold">
                                        Diff
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
                              Additional Information
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              {/* Outer Fields */}
                              <div className="border rounded-md overflow-hidden">
                                <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                                  Outer
                                </div>
                                <div className="p-2 space-y-1.5 text-[11px]">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Combined With:</span>
                                    <span className="font-medium">
                                      {displayValue(
                                        data?.outerData?.combinedWith ||
                                          data?.outerBefore?.combinedWith,
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Mating Part:</span>
                                    <span className="font-medium">
                                      {displayValue(
                                        data?.outerData?.matingPart ||
                                          data?.outerBefore?.matingPart,
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Has Been Adjusted:
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
                                  Inner
                                </div>
                                <div className="p-2 space-y-1.5 text-[11px]">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Combined With:</span>
                                    <span className="font-medium">
                                      {displayValue(
                                        data?.innerData?.combinedWith ||
                                          data?.innerBefore?.combinedWith,
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Mating Part:</span>
                                    <span className="font-medium">
                                      {displayValue(
                                        data?.innerData?.matingPart ||
                                          data?.innerBefore?.matingPart,
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Has Been Adjusted:
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
                                Shutdown Adjustment Mechanism
                              </div>
                              <div className="border rounded-md overflow-hidden">
                                <div className="p-2 space-y-1.5 text-[11px]">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Slide Motor/Mounts:
                                    </span>
                                    <span className="font-medium">
                                      {displayValue(
                                        data?.outerData?.slideMotorMounts ||
                                          data?.outerBefore?.slideMotorMounts,
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Power Cord/Hoses:</span>
                                    <span className="font-medium">
                                      {displayValue(
                                        data?.outerData?.powerCordHoses ||
                                          data?.outerBefore?.powerCordHoses,
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Chains & Gears/Sprockets:
                                    </span>
                                    <span className="font-medium">
                                      {displayValue(
                                        data?.outerData?.chainsGearsSprockets ||
                                          data?.outerBefore?.chainsGearsSprockets,
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Locking Clamps:</span>
                                    <span className="font-medium">
                                      {displayValue(
                                        data?.outerData?.lockingClamps ||
                                          data?.outerBefore?.lockingClamps,
                                      )}
                                    </span>
                                  </div>
                                  {(data?.outerData?.notes || data?.outerBefore?.notes) && (
                                    <div className="flex flex-col gap-1 pt-1 border-t">
                                      <span className="text-muted-foreground">Notes:</span>
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

                // Helper to check if nested object has actual values
                const hasValues = (obj: any) =>
                  obj && Object.values(obj).some((v) => v !== null && v !== undefined && v !== '');

                const hasBeforeData =
                  hasValues((data as any).outerBefore) || hasValues((data as any).innerBefore);
                const hasMainData =
                  hasValues((data as any).outerData) || hasValues((data as any).innerData);

                return (
                  <Collapsible key={sectionKey} defaultOpen={true}>
                    <div className="border rounded-lg">
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2">
                          <Typography variant="h4" className="font-semibold text-sm">
                            {t('sectionNames.slide')}
                          </Typography>
                          <span className="text-xs text-green-600 dark:text-green-400">
                            ({tServices('modal.status.complete')})
                          </span>
                        </div>
                        <ChevronUp className="w-4 h-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-3 pt-0 text-xs">
                        {/* Before Measurements (if exists) */}
                        {hasBeforeData && (
                          <div className="border-t pt-2 mb-3">
                            <div className="font-medium text-muted-foreground mb-2 text-[11px]">
                              {tServices('modal.sections.beforeMaintenance')}
                            </div>
                            <div className="border rounded-md overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-muted/50">
                                    <TableHead className="h-8 text-[10px] font-semibold border-r">
                                      Field
                                    </TableHead>
                                    <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                      Outer
                                    </TableHead>
                                    <TableHead className="h-8 text-[10px] text-center font-semibold">
                                      Inner
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {Object.keys(
                                    (data as any).outerBefore || (data as any).innerBefore || {},
                                  ).map((key) => (
                                    <TableRow key={key} className="text-[11px] hover:bg-muted/30">
                                      <TableCell className="py-1.5 font-medium border-r bg-muted/20">
                                        {formatFieldName(key)}
                                      </TableCell>
                                      <TableCell className="py-1.5 text-center border-r">
                                        {displayValue((data as any).outerBefore?.[key])}
                                      </TableCell>
                                      <TableCell className="py-1.5 text-center">
                                        {displayValue((data as any).innerBefore?.[key])}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        )}

                        {/* Data Measurements (if exists) */}
                        {hasMainData && (
                          <div className="border-t pt-2 mb-3">
                            <div className="font-medium text-muted-foreground mb-2 text-[11px]">
                              Data Measurements
                            </div>
                            <div className="border rounded-md overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-muted/50">
                                    <TableHead className="h-8 text-[10px] font-semibold border-r">
                                      Field
                                    </TableHead>
                                    <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                      Outer
                                    </TableHead>
                                    <TableHead className="h-8 text-[10px] text-center font-semibold">
                                      Inner
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {Object.keys(
                                    (data as any).outerData || (data as any).innerData || {},
                                  ).map((key) => (
                                    <TableRow key={key} className="text-[11px] hover:bg-muted/30">
                                      <TableCell className="py-1.5 font-medium border-r bg-muted/20">
                                        {formatFieldName(key)}
                                      </TableCell>
                                      <TableCell className="py-1.5 text-center border-r">
                                        {displayValue((data as any).outerData?.[key])}
                                      </TableCell>
                                      <TableCell className="py-1.5 text-center">
                                        {displayValue((data as any).innerData?.[key])}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        )}

                        {/* Show message if no data to display */}
                        {!hasBeforeData && !hasMainData && (
                          <div className="border-t pt-2">
                            <Typography variant="muted" className="text-center py-4 text-xs">
                              Nenhum dado disponível
                            </Typography>
                          </div>
                        )}

                        {/* Section-level fields table */}
                        {Object.entries(data).filter(
                          ([key, value]) =>
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
                              Section Fields
                            </div>
                            <div className="border rounded-md overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-muted/50">
                                    <TableHead className="h-8 text-[10px] font-semibold border-r">
                                      Field
                                    </TableHead>
                                    <TableHead className="h-8 text-[10px] text-center font-semibold">
                                      Value
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {Object.entries(data)
                                    .filter(
                                      ([key, value]) =>
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
                                          {formatFieldName(key)}
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

                const outerBeforeRows = extractBearingRows(data?.outerBefore);
                const innerBeforeRows = extractBearingRows(data?.innerBefore);
                const outerDataRows = extractBearingRows(data?.outerData);
                const innerDataRows = extractBearingRows(data?.innerData);

                return (
                  <Collapsible key={sectionKey} defaultOpen={true}>
                    <div className="border rounded-lg">
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2">
                          <Typography variant="h4" className="font-semibold text-sm">
                            {t('sectionNames.gibs')}
                          </Typography>
                          <span className="text-xs text-green-600 dark:text-green-400">
                            ({tServices('modal.status.complete')})
                          </span>
                        </div>
                        <ChevronUp className="w-4 h-4 transition-transform duration-200 data-[state=open]:rotate-180" />
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
                                  Outer
                                </div>
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-muted/50">
                                      <TableHead className="h-8 text-[10px] font-semibold border-r">
                                        Field
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                        LH
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                        RH
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold">
                                        Diff
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
                                  Inner
                                </div>
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-muted/50">
                                      <TableHead className="h-8 text-[10px] font-semibold border-r">
                                        Field
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                        LH
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                        RH
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold">
                                        Diff
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
                                Data Measurements
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-3">
                              {/* Outer Table */}
                              <div className="border rounded-md overflow-hidden">
                                <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                                  Outer
                                </div>
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-muted/50">
                                      <TableHead className="h-8 text-[10px] font-semibold border-r">
                                        Field
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                        LH
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                        RH
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold">
                                        Diff
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
                                  Inner
                                </div>
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-muted/50">
                                      <TableHead className="h-8 text-[10px] font-semibold border-r">
                                        Field
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                        LH
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                        RH
                                      </TableHead>
                                      <TableHead className="h-8 text-[10px] text-center font-semibold">
                                        Diff
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
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2">
                          <Typography variant="h4" className="font-semibold text-sm">
                            {t('sectionNames.counterbalance')}
                          </Typography>
                          <span className="text-xs text-green-600 dark:text-green-400">
                            ({tServices('modal.status.complete')})
                          </span>
                        </div>
                        <ChevronUp className="w-4 h-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-3 pt-0 text-xs">
                        <div className="border-t pt-2">
                          <div className="grid grid-cols-2 gap-3">
                            {data?.outerData && (
                              <div className="border rounded-md overflow-hidden">
                                <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                                  Outer
                                </div>
                                <div className="p-2 space-y-1.5 text-[11px]">
                                  {Object.entries(data.outerData)
                                    .filter(([key]) => key !== 'notes')
                                    .map(([key, value]) => (
                                      <div key={key} className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          {formatFieldName(key)}:
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
                                  Inner
                                </div>
                                <div className="p-2 space-y-1.5 text-[11px]">
                                  {Object.entries(data.innerData)
                                    .filter(([key]) => key !== 'notes')
                                    .map(([key, value]) => (
                                      <div key={key} className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          {formatFieldName(key)}:
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
                                Notes
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

              // For other sections (CLUTCH, LUBRICATION_HYDRAULICS), render a simple table
              const data = completedSectionData[sectionKey] || {};

              // Filter out object/array fields (we'll handle gauges separately for lubrication)
              const scalarFields = Object.entries(data).filter(
                ([key, value]) =>
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
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <Typography variant="h4" className="font-semibold text-sm">
                          {t(`sectionNames.${sectionConfig.metadata.i18nKey}`)}
                        </Typography>
                        <span className="text-xs text-green-600 dark:text-green-400">
                          ({tServices('modal.status.complete')})
                        </span>
                      </div>
                      <ChevronUp className="w-4 h-4 transition-transform duration-200 data-[state=open]:rotate-180" />
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
                                    Field
                                  </TableHead>
                                  <TableHead className="h-8 text-[10px] text-center font-semibold">
                                    Value
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {scalarFields.map(([key, value]) => (
                                  <TableRow key={key} className="text-[11px] hover:bg-muted/30">
                                    <TableCell className="py-1.5 font-medium border-r bg-muted/20">
                                      {formatFieldName(key)}
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
                            Gauges
                          </div>
                          <div className="border rounded-md overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-muted/50">
                                  <TableHead className="h-8 text-[10px] font-semibold border-r">
                                    System
                                  </TableHead>
                                  <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                                    Gauge
                                  </TableHead>
                                  <TableHead className="h-8 text-[10px] text-center font-semibold">
                                    PSI
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

        <div className="flex justify-end gap-3 pt-4 px-4 border-t">
          <Button type="button" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
