'use client';

import { useState, useEffect, useRef } from 'react';
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
import { Plus, Trash2, GripVertical, Columns, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ColumnConfigDto } from '@titans-tech/shared/backend-dtos';

// Default columns that always exist - these are the base columns
const DEFAULT_COLUMN_KEYS = ['partNumber', 'description', 'quantity', 'unit'];

const DEFAULT_COLUMNS: ColumnConfigDto[] = [
  { key: 'partNumber', label: 'Part Number', type: 'text', required: true },
  { key: 'description', label: 'Description', type: 'text', required: true },
  { key: 'quantity', label: 'Quantity', type: 'text', required: true },
  { key: 'unit', label: 'Unit', type: 'text', required: true },
];

interface ColumnManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: ColumnConfigDto[];
  onSave: (columns: ColumnConfigDto[]) => Promise<boolean>;
}

export function ColumnManagerModal({
  isOpen,
  onClose,
  columns: initialColumns,
  onSave,
}: ColumnManagerModalProps) {
  const t = useTranslations('machines.partsConfig');
  const tParts = useTranslations('parts');

  // All columns including default ones
  const [allColumns, setAllColumns] = useState<ColumnConfigDto[]>([]);
  const [saving, setSaving] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Reset columns when modal opens - merge default columns with custom ones
  useEffect(() => {
    if (isOpen) {
      // Check if we have stored column order (includes defaults)
      const hasDefaultsInConfig = initialColumns.some((c) => DEFAULT_COLUMN_KEYS.includes(c.key));

      if (hasDefaultsInConfig) {
        // Use the stored order
        setAllColumns([...initialColumns]);
      } else {
        // Initialize with default columns first, then custom ones
        const defaultCols = DEFAULT_COLUMNS.map((col) => ({
          ...col,
          label: tParts(`tableHeaders.${col.key}`),
        }));
        setAllColumns([...defaultCols, ...initialColumns]);
      }
    }
  }, [isOpen, initialColumns, tParts]);

  const isDefaultColumn = (key: string) => DEFAULT_COLUMN_KEYS.includes(key);

  const addColumn = () => {
    const newKey = `custom_${Date.now()}`;
    setAllColumns([
      ...allColumns,
      {
        key: newKey,
        label: '',
        type: 'text',
        required: false,
      },
    ]);
    // Scroll to the new column after state updates
    setTimeout(() => {
      scrollContainerRef.current?.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }, 50);
  };

  const removeColumn = (index: number) => {
    const column = allColumns[index];
    if (isDefaultColumn(column.key)) return; // Can't remove default columns
    setAllColumns(allColumns.filter((_, i) => i !== index));
  };

  const updateColumn = (index: number, field: keyof ColumnConfigDto, value: string | boolean) => {
    const column = allColumns[index];
    // Don't allow editing default column labels or types
    if (isDefaultColumn(column.key) && (field === 'label' || field === 'type')) return;

    const newColumns = [...allColumns];
    newColumns[index] = { ...newColumns[index], [field]: value };
    setAllColumns(newColumns);
  };

  const moveColumn = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= allColumns.length) return;
    const newColumns = [...allColumns];
    const [moved] = newColumns.splice(fromIndex, 1);
    newColumns.splice(toIndex, 0, moved);
    setAllColumns(newColumns);
  };

  const handleSubmit = async () => {
    // Filter out empty custom columns (keep defaults)
    const validColumns = allColumns.filter((c) => isDefaultColumn(c.key) || c.label.trim());

    // Ensure custom keys are unique and valid
    const processedColumns = validColumns.map((col, idx) => ({
      ...col,
      key: col.key || `custom_${idx}_${Date.now()}`,
    }));

    setSaving(true);
    try {
      const success = await onSave(processedColumns);
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

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Columns className="h-5 w-5" />
            {t('manageColumns')}
          </DialogTitle>
          <DialogDescription>{t('manageColumnsDescription')}</DialogDescription>
        </DialogHeader>

        <div ref={scrollContainerRef} className="flex-1 overflow-auto min-h-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">{t('columnOrder')}</TableHead>
                <TableHead>{t('columnLabel')}</TableHead>
                <TableHead className="w-32">{t('columnType')}</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allColumns.map((column, index) => {
                const isDefault = isDefaultColumn(column.key);
                return (
                  <TableRow key={column.key || index}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        <div className="flex flex-col gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => moveColumn(index, index - 1)}
                            disabled={index === 0}
                          >
                            <span className="text-xs">▲</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => moveColumn(index, index + 1)}
                            disabled={index === allColumns.length - 1}
                          >
                            <span className="text-xs">▼</span>
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {isDefault ? (
                          <>
                            <span className="text-sm">{column.label}</span>
                            <Badge variant="secondary" className="text-xs">
                              <Lock className="h-3 w-3 mr-1" />
                              {t('defaultColumn')}
                            </Badge>
                          </>
                        ) : (
                          <Input
                            value={column.label}
                            onChange={(e) => updateColumn(index, 'label', e.target.value)}
                            placeholder={t('columnLabelPlaceholder')}
                            className={`h-8 ${!column.label.trim() ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                            autoFocus={!column.label.trim()}
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {isDefault ? (
                        <span className="text-sm text-muted-foreground">{t('columnTypeText')}</span>
                      ) : (
                        <Select
                          value={column.type}
                          onValueChange={(value) => updateColumn(index, 'type', value)}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">{t('columnTypeText')}</SelectItem>
                            <SelectItem value="number">{t('columnTypeNumber')}</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell>
                      {!isDefault && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeColumn(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {allColumns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    {t('noCustomColumns')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="pt-4 border-t">
          <Button variant="outline" size="sm" onClick={addColumn}>
            <Plus className="h-4 w-4 mr-2" />
            {t('addColumn')}
          </Button>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? t('saving') : t('saveColumns')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
