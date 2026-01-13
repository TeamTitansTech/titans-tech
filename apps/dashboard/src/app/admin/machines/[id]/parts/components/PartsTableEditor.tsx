'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash2, GripVertical, Columns, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SubsectionResponseDto, ColumnConfigDto } from '@titans-tech/shared/backend-dtos';
import { ColumnManagerModal } from './ColumnManagerModal';
import { ColumnMappingModal } from './ColumnMappingModal';
import { updateSubsection } from '@/data/services/machine-parts.api';
import { toast } from 'sonner';

interface PartItem {
  partNumber: string;
  description: string;
  quantity: string;
  unit: string;
  location?: string;
  notes?: string;
  customFields?: Record<string, string>;
}

interface PartsTableEditorProps {
  isOpen: boolean;
  onClose: () => void;
  subsection: SubsectionResponseDto;
  machineId: string;
  onSave: (parts: PartItem[]) => Promise<boolean>;
  onColumnsChange?: (columns: ColumnConfigDto[]) => void;
}

// Default column keys
const DEFAULT_COLUMN_KEYS = ['partNumber', 'description', 'quantity', 'unit'];

// Default column configuration with widths
const DEFAULT_COLUMN_CONFIG: Record<string, { labelKey: string; width: string }> = {
  partNumber: { labelKey: 'tableHeaders.partNumber', width: 'w-32' },
  description: { labelKey: 'tableHeaders.description', width: '' },
  quantity: { labelKey: 'tableHeaders.quantity', width: 'w-20' },
  unit: { labelKey: 'tableHeaders.unit', width: 'w-20' },
};

export function PartsTableEditor({
  isOpen,
  onClose,
  subsection,
  machineId,
  onSave,
  onColumnsChange,
}: PartsTableEditorProps) {
  const t = useTranslations('machines.partsConfig');
  const tParts = useTranslations('parts');

  const [parts, setParts] = useState<PartItem[]>([]);
  const [allColumns, setAllColumns] = useState<ColumnConfigDto[]>([]);
  const [saving, setSaving] = useState(false);

  // Check if a column is a default column
  const isDefaultColumn = (key: string) => DEFAULT_COLUMN_KEYS.includes(key);
  const [isDragging, setIsDragging] = useState(false);

  // Column manager modal state
  const [showColumnManager, setShowColumnManager] = useState(false);

  // Column mapping modal state
  const [showColumnMapping, setShowColumnMapping] = useState(false);
  const [importedData, setImportedData] = useState<{
    columns: string[];
    rows: Record<string, string>[];
  }>({ columns: [], rows: [] });

  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Reset parts and columns when subsection changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setParts(
        subsection.parts.map((p) => ({
          partNumber: p.partNumber,
          description: p.description,
          quantity: p.quantity,
          unit: p.unit,
          location: p.location || undefined,
          notes: p.notes || undefined,
          customFields: p.customFields || undefined,
        })),
      );

      // Initialize columns - check if columnConfig includes default columns (ordered)
      const savedConfig = subsection.columnConfig || [];
      const hasDefaultsInConfig = savedConfig.some((c) => DEFAULT_COLUMN_KEYS.includes(c.key));

      if (hasDefaultsInConfig && savedConfig.length > 0) {
        // Use saved order (includes defaults)
        setAllColumns(savedConfig);
      } else {
        // Build default order: default columns first, then custom ones
        const defaultCols: ColumnConfigDto[] = DEFAULT_COLUMN_KEYS.map((key) => ({
          key,
          label: tParts(DEFAULT_COLUMN_CONFIG[key].labelKey),
          type: 'text' as const,
          required: true,
        }));
        setAllColumns([...defaultCols, ...savedConfig]);
      }
    }
  }, [isOpen, subsection, tParts]);

  // Parse Excel (tab-separated) text
  const handleExcelPaste = useCallback(
    (text: string) => {
      const lines = text.trim().split('\n');
      if (lines.length < 2) {
        toast.error(t('pasteNeedsHeaderAndRows'));
        return;
      }

      const headers = lines[0].split('\t').map((h) => h.trim());
      const rows = lines.slice(1).map((line) => {
        const values = line.split('\t');
        return headers.reduce(
          (obj, header, i) => {
            obj[header] = values[i]?.trim() || '';
            return obj;
          },
          {} as Record<string, string>,
        );
      });

      setImportedData({ columns: headers, rows });
      setShowColumnMapping(true);
    },
    [t],
  );

  // Handle image import for OCR - DISABLED FOR NOW (coming soon)
  const handleImageImport = useCallback(
    async (_file: File) => {
      // OCR feature is coming soon - show message instead
      toast.info(t('ocrComingSoon'));
    },
    [t],
  );

  // Handle paste events (Excel or image)
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = async (e: ClipboardEvent) => {
      // Check for image in clipboard
      const items = Array.from(e.clipboardData?.items || []);
      const imageItem = items.find((item) => item.type.startsWith('image/'));

      if (imageItem) {
        e.preventDefault();
        const file = imageItem.getAsFile();
        if (file) {
          await handleImageImport(file);
        }
        return;
      }

      // Check for text (Excel paste = tab-separated)
      const text = e.clipboardData?.getData('text/plain');
      if (text?.includes('\t')) {
        e.preventDefault();
        handleExcelPaste(text);
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [isOpen, handleImageImport, handleExcelPaste]);

  // Handle drag & drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if leaving the drop zone entirely
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const imageFile = files.find((f) => f.type.startsWith('image/'));

      if (imageFile) {
        await handleImageImport(imageFile);
      } else {
        toast.error(t('dropImageOnly'));
      }
    },
    [handleImageImport, t],
  );

  // Handle import from column mapping modal
  const handleImportComplete = useCallback(
    (importedParts: PartItem[], newColumns: ColumnConfigDto[]) => {
      // Merge imported parts with existing
      setParts((prev) => [...prev, ...importedParts]);

      // Check if new custom columns were added
      const currentCustomCols = allColumns.filter((c) => !isDefaultColumn(c.key));
      const newCustomCols = newColumns.filter((c) => !isDefaultColumn(c.key));

      if (newCustomCols.length > currentCustomCols.length) {
        // Add the new custom columns to allColumns
        const addedCols = newCustomCols.filter(
          (nc) => !currentCustomCols.some((cc) => cc.key === nc.key),
        );
        setAllColumns((prev) => [...prev, ...addedCols]);
      }

      toast.success(t('importSuccess', { count: importedParts.length }));
    },
    [allColumns, t],
  );

  // Save column config changes
  const handleSaveColumns = useCallback(
    async (newColumns: ColumnConfigDto[]) => {
      try {
        const result = await updateSubsection(machineId, subsection.id, {
          columnConfig: newColumns,
        });

        if (result.errors) {
          toast.error(result.errors[0] || t('saveColumnsFailed'));
          return false;
        }

        setAllColumns(newColumns);
        onColumnsChange?.(newColumns);
        toast.success(t('columnsSaved'));
        return true;
      } catch (error) {
        console.error('Error saving columns:', error);
        toast.error(t('saveColumnsFailed'));
        return false;
      }
    },
    [machineId, subsection.id, onColumnsChange, t],
  );

  const addPart = () => {
    setParts([
      ...parts,
      {
        partNumber: '',
        description: '',
        quantity: '1',
        unit: 'EA',
      },
    ]);
  };

  const removePart = (index: number) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  const updatePart = (index: number, field: string, value: string) => {
    const newParts = [...parts];
    if (isDefaultColumn(field)) {
      // Update default field
      newParts[index] = { ...newParts[index], [field]: value };
    } else {
      // Update custom field
      newParts[index] = {
        ...newParts[index],
        customFields: {
          ...(newParts[index].customFields || {}),
          [field]: value,
        },
      };
    }
    setParts(newParts);
  };

  // Check if a part has all required fields filled
  const isPartValid = (part: PartItem) =>
    part.partNumber.trim() && part.description.trim() && part.quantity.trim() && part.unit.trim();

  // Check if all parts are valid (or no parts exist)
  const allPartsValid = parts.length === 0 || parts.every(isPartValid);

  const handleSubmit = async () => {
    if (!allPartsValid) return;

    setSaving(true);
    try {
      const success = await onSave(parts);
      if (success) {
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  // Get value for a part field (handles both default and custom fields)
  const getPartValue = (part: PartItem, fieldKey: string): string => {
    if (isDefaultColumn(fieldKey)) {
      return (part[fieldKey as keyof PartItem] as string) || '';
    }
    return part.customFields?.[fieldKey] || '';
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {t('editParts')}: {subsection.name}
            </DialogTitle>
            <DialogDescription>{t('editPartsDescription')}</DialogDescription>
          </DialogHeader>

          {/* Import Drop Zone */}
          <div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'border-2 border-dashed rounded-lg p-4 text-center transition-colors',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50',
            )}
          >
            <div className="flex flex-col items-center justify-center gap-1 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <span>{t('pasteFromExcel')}</span>
              </div>
              <span className="text-xs text-muted-foreground/60">{t('imageImportComingSoon')}</span>
            </div>
          </div>

          <div className="flex-1 overflow-auto min-h-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  {allColumns.map((col) => (
                    <TableHead
                      key={col.key}
                      className={
                        isDefaultColumn(col.key)
                          ? DEFAULT_COLUMN_CONFIG[col.key]?.width || ''
                          : 'w-28'
                      }
                    >
                      {isDefaultColumn(col.key)
                        ? tParts(DEFAULT_COLUMN_CONFIG[col.key].labelKey)
                        : col.label}
                    </TableHead>
                  ))}
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parts.map((part, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    </TableCell>
                    {allColumns.map((col) => {
                      const value = getPartValue(part, col.key);
                      const isRequired = isDefaultColumn(col.key);
                      const isEmpty = isRequired && !value.trim();
                      return (
                        <TableCell key={col.key}>
                          <Input
                            type={
                              !isDefaultColumn(col.key) && col.type === 'number' ? 'number' : 'text'
                            }
                            value={value}
                            onChange={(e) => updatePart(index, col.key, e.target.value)}
                            placeholder={
                              col.key === 'quantity'
                                ? '1'
                                : col.key === 'unit'
                                  ? 'EA'
                                  : col.key === 'partNumber'
                                    ? '123-456'
                                    : ''
                            }
                            className={cn('h-8', isEmpty && 'border-destructive')}
                          />
                        </TableCell>
                      );
                    })}
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removePart(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {parts.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={allColumns.length + 2}
                      className="text-center text-muted-foreground py-8"
                    >
                      {t('noPartsInSubsection')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="pt-4 border-t flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={addPart}>
              <Plus className="h-4 w-4 mr-2" />
              {t('addPart')}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowColumnManager(true)}>
              <Columns className="h-4 w-4 mr-2" />
              {t('manageColumns')}
            </Button>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button onClick={handleSubmit} disabled={saving || !allPartsValid}>
              {saving ? t('saving') : t('saveParts')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Column Manager Modal */}
      <ColumnManagerModal
        isOpen={showColumnManager}
        onClose={() => setShowColumnManager(false)}
        columns={allColumns}
        onSave={handleSaveColumns}
      />

      {/* Column Mapping Modal */}
      <ColumnMappingModal
        isOpen={showColumnMapping}
        onClose={() => setShowColumnMapping(false)}
        importedColumns={importedData.columns}
        importedRows={importedData.rows}
        customColumns={allColumns.filter((c) => !isDefaultColumn(c.key))}
        onImport={handleImportComplete}
      />
    </>
  );
}
