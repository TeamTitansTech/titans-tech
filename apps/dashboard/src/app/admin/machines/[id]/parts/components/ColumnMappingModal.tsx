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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowRight, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { ColumnConfigDto } from '@titans-tech/shared/backend-dtos';

// Default columns that exist in all parts tables
const DEFAULT_COLUMNS = [
  { key: 'partNumber', label: 'Part Number' },
  { key: 'description', label: 'Description' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'unit', label: 'Unit' },
  { key: 'location', label: 'Location' },
  { key: 'notes', label: 'Notes' },
];

interface PartItem {
  partNumber: string;
  description: string;
  quantity: string;
  unit: string;
  location?: string;
  notes?: string;
  customFields?: Record<string, string>;
}

interface ColumnMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  importedColumns: string[];
  importedRows: Record<string, string>[];
  customColumns: ColumnConfigDto[];
  onImport: (parts: PartItem[], newColumns: ColumnConfigDto[]) => void;
}

type MappingTarget = 'skip' | 'new' | string;

export function ColumnMappingModal({
  isOpen,
  onClose,
  importedColumns,
  importedRows,
  customColumns,
  onImport,
}: ColumnMappingModalProps) {
  const t = useTranslations('machines.partsConfig');

  const [mappings, setMappings] = useState<Record<string, MappingTarget>>({});

  // Helper function to create auto-mappings
  const createAutoMappings = useCallback(
    (columns: string[]): Record<string, MappingTarget> => {
      const newMappings: Record<string, MappingTarget> = {};
      columns.forEach((col) => {
        const lowerCol = col.toLowerCase().trim();

        // Try to auto-map to default columns
        const defaultMatch = DEFAULT_COLUMNS.find(
          (dc) =>
            dc.key.toLowerCase() === lowerCol ||
            dc.label.toLowerCase() === lowerCol ||
            lowerCol.includes(dc.key.toLowerCase()) ||
            lowerCol.includes(dc.label.toLowerCase()),
        );

        if (defaultMatch) {
          newMappings[col] = defaultMatch.key;
        } else {
          // Try to match custom columns
          const customMatch = customColumns.find(
            (cc) =>
              cc.key.toLowerCase() === lowerCol ||
              cc.label.toLowerCase() === lowerCol ||
              lowerCol.includes(cc.label.toLowerCase()),
          );

          if (customMatch) {
            newMappings[col] = `custom:${customMatch.key}`;
          } else {
            // Default to creating a new column
            newMappings[col] = 'new';
          }
        }
      });
      return newMappings;
    },
    [customColumns],
  );

  // Reset mappings when import data changes
  useEffect(() => {
    setMappings(createAutoMappings(importedColumns));
  }, [importedColumns, createAutoMappings]);

  const updateMapping = (importedCol: string, target: MappingTarget) => {
    setMappings((prev) => ({ ...prev, [importedCol]: target }));
  };

  // Check if required columns are mapped
  const hasPartNumber = Object.values(mappings).includes('partNumber');
  const hasDescription = Object.values(mappings).includes('description');
  const canImport = hasPartNumber && hasDescription && importedRows.length > 0;

  const handleImport = () => {
    // Build new custom columns from 'new' mappings
    const newCustomColumns: ColumnConfigDto[] = [];
    const customFieldMappings: Record<string, string> = {}; // importedCol -> customFieldKey

    Object.entries(mappings).forEach(([importedCol, target]) => {
      if (target === 'new') {
        const key = `custom_${importedCol
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '')}`;
        newCustomColumns.push({
          key,
          label: importedCol,
          type: 'text',
          required: false,
        });
        customFieldMappings[importedCol] = key;
      } else if (target.startsWith('custom:')) {
        customFieldMappings[importedCol] = target.replace('custom:', '');
      }
    });

    // Transform rows to parts
    const parts: PartItem[] = importedRows.map((row) => {
      const part: PartItem = {
        partNumber: '',
        description: '',
        quantity: '1',
        unit: 'EA',
      };

      const customFields: Record<string, string> = {};

      Object.entries(mappings).forEach(([importedCol, target]) => {
        const value = row[importedCol] || '';

        if (target === 'skip') {
          return;
        }

        if (DEFAULT_COLUMNS.some((dc) => dc.key === target)) {
          // Map to default column
          if (target === 'partNumber') part.partNumber = value;
          else if (target === 'description') part.description = value;
          else if (target === 'quantity') part.quantity = value || '1';
          else if (target === 'unit') part.unit = value || 'EA';
          else if (target === 'location') part.location = value || undefined;
          else if (target === 'notes') part.notes = value || undefined;
        } else if (target === 'new' || target.startsWith('custom:')) {
          // Map to custom field
          const fieldKey = customFieldMappings[importedCol];
          if (fieldKey && value) {
            customFields[fieldKey] = value;
          }
        }
      });

      if (Object.keys(customFields).length > 0) {
        part.customFields = customFields;
      }

      return part;
    });

    // Filter out parts without required fields
    const validParts = parts.filter((p) => p.partNumber.trim() && p.description.trim());

    // Merge new columns with existing custom columns
    const allCustomColumns = [...customColumns, ...newCustomColumns];

    onImport(validParts, allCustomColumns);
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  // Get display name for a mapping target
  const getTargetLabel = (target: MappingTarget): string => {
    if (target === 'skip') return t('skipColumn');
    if (target === 'new') return t('createNewColumn');

    const defaultCol = DEFAULT_COLUMNS.find((dc) => dc.key === target);
    if (defaultCol) return defaultCol.label;

    if (target.startsWith('custom:')) {
      const customKey = target.replace('custom:', '');
      const customCol = customColumns.find((cc) => cc.key === customKey);
      return customCol?.label || customKey;
    }

    return target;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            {t('mapImportedColumns')}
          </DialogTitle>
          <DialogDescription>{t('mapImportedColumnsDescription')}</DialogDescription>
        </DialogHeader>

        {!canImport && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {!hasPartNumber && !hasDescription
                ? t('mappingRequiredBoth')
                : !hasPartNumber
                  ? t('mappingRequiredPartNumber')
                  : t('mappingRequiredDescription')}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex-1 overflow-auto min-h-0">
          <div className="space-y-6">
            {/* Column Mapping Section */}
            <div>
              <h4 className="text-sm font-medium mb-3">{t('columnMappings')}</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('importedColumn')}</TableHead>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>{t('mapTo')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importedColumns.map((col) => (
                    <TableRow key={col}>
                      <TableCell className="font-medium">{col}</TableCell>
                      <TableCell>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={mappings[col] || 'skip'}
                          onValueChange={(value) => updateMapping(col, value as MappingTarget)}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue>{getTargetLabel(mappings[col] || 'skip')}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="skip">{t('skipColumn')}</SelectItem>
                            <SelectItem value="new">{t('createNewColumn')}</SelectItem>
                            {DEFAULT_COLUMNS.map((dc) => (
                              <SelectItem key={dc.key} value={dc.key}>
                                {dc.label}
                              </SelectItem>
                            ))}
                            {customColumns.length > 0 && (
                              <>
                                {customColumns.map((cc) => (
                                  <SelectItem key={`custom:${cc.key}`} value={`custom:${cc.key}`}>
                                    {cc.label} (custom)
                                  </SelectItem>
                                ))}
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Preview Section */}
            <div>
              <h4 className="text-sm font-medium mb-3">
                {t('preview')} ({importedRows.length} {t('rows')})
              </h4>
              <div className="border rounded-md overflow-auto max-h-[200px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {importedColumns.map((col) => (
                        <TableHead key={col} className="text-xs whitespace-nowrap">
                          {col}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importedRows.slice(0, 5).map((row, idx) => (
                      <TableRow key={idx}>
                        {importedColumns.map((col) => (
                          <TableCell
                            key={col}
                            className="text-xs whitespace-nowrap max-w-[150px] truncate"
                          >
                            {row[col] || ''}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                    {importedRows.length > 5 && (
                      <TableRow>
                        <TableCell
                          colSpan={importedColumns.length}
                          className="text-center text-muted-foreground text-xs"
                        >
                          ... {t('andMoreRows', { count: importedRows.length - 5 })}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button onClick={handleImport} disabled={!canImport}>
            {t('importRows', { count: importedRows.length })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
