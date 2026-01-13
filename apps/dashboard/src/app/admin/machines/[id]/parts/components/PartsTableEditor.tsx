'use client';

import { useState, useEffect } from 'react';
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
import { Plus, Trash2, GripVertical } from 'lucide-react';
import type { SubsectionResponseDto } from '@titans-tech/shared/backend-dtos';

interface PartItem {
  partNumber: string;
  description: string;
  quantity: string;
  unit: string;
  location?: string;
  notes?: string;
}

interface PartsTableEditorProps {
  isOpen: boolean;
  onClose: () => void;
  subsection: SubsectionResponseDto;
  onSave: (parts: PartItem[]) => Promise<boolean>;
}

export function PartsTableEditor({ isOpen, onClose, subsection, onSave }: PartsTableEditorProps) {
  const t = useTranslations('machines.partsConfig');
  const tParts = useTranslations('parts');

  const [parts, setParts] = useState<PartItem[]>([]);
  const [saving, setSaving] = useState(false);

  // Reset parts when subsection changes or modal opens
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
        })),
      );
    }
  }, [isOpen, subsection]);

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

  const updatePart = (index: number, field: keyof PartItem, value: string) => {
    const newParts = [...parts];
    newParts[index] = { ...newParts[index], [field]: value };
    setParts(newParts);
  };

  const handleSubmit = async () => {
    // Filter out empty parts
    const validParts = parts.filter((p) => p.partNumber.trim() && p.description.trim());

    setSaving(true);
    try {
      const success = await onSave(validParts);
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
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {t('editParts')}: {subsection.name}
          </DialogTitle>
          <DialogDescription>{t('editPartsDescription')}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto min-h-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead className="w-32">{tParts('tableHeaders.partNumber')}</TableHead>
                <TableHead>{tParts('tableHeaders.description')}</TableHead>
                <TableHead className="w-20">{tParts('tableHeaders.quantity')}</TableHead>
                <TableHead className="w-20">{tParts('tableHeaders.unit')}</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parts.map((part, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={part.partNumber}
                      onChange={(e) => updatePart(index, 'partNumber', e.target.value)}
                      placeholder="123-456"
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={part.description}
                      onChange={(e) => updatePart(index, 'description', e.target.value)}
                      placeholder="Part description"
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={part.quantity}
                      onChange={(e) => updatePart(index, 'quantity', e.target.value)}
                      placeholder="1"
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={part.unit}
                      onChange={(e) => updatePart(index, 'unit', e.target.value)}
                      placeholder="EA"
                      className="h-8"
                    />
                  </TableCell>
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
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    {t('noPartsInSubsection')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="pt-4 border-t">
          <Button variant="outline" size="sm" onClick={addPart}>
            <Plus className="h-4 w-4 mr-2" />
            {t('addPart')}
          </Button>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? t('saving') : t('saveParts')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
