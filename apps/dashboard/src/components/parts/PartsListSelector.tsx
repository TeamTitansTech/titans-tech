'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { FileDown, Package, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { Part } from '@/data/parts/clutch-parts';

interface PartsListSelectorProps {
  parts: Part[];
  title: string;
  description?: string;
  machineName?: string;
  machineSerial?: string;
  sectionName?: string;
  onSelectionChange?: (selectedParts: Part[]) => void;
}

export function PartsListSelector({
  parts,
  title,
  description,
  machineName = 'N/A',
  machineSerial = 'N/A',
  sectionName = 'Inspection',
  onSelectionChange,
}: PartsListSelectorProps) {
  const t = useTranslations('parts');
  const [selectedPartNumbers, setSelectedPartNumbers] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);

  const handleTogglePart = useCallback(
    (partNumber: string) => {
      setSelectedPartNumbers((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(partNumber)) {
          newSet.delete(partNumber);
        } else {
          newSet.add(partNumber);
        }

        // Notify parent of selection change
        if (onSelectionChange) {
          const selectedParts = parts.filter((p) => newSet.has(p.partNumber));
          onSelectionChange(selectedParts);
        }

        return newSet;
      });
    },
    [parts, onSelectionChange],
  );

  const handleSelectAll = useCallback(() => {
    const allPartNumbers = new Set(parts.map((p) => p.partNumber));
    setSelectedPartNumbers(allPartNumbers);
    if (onSelectionChange) {
      onSelectionChange(parts);
    }
  }, [parts, onSelectionChange]);

  const handleDeselectAll = useCallback(() => {
    setSelectedPartNumbers(new Set());
    if (onSelectionChange) {
      onSelectionChange([]);
    }
  }, [onSelectionChange]);

  const selectedParts = parts.filter((p) => selectedPartNumbers.has(p.partNumber));

  const exportToPDF = useCallback(async () => {
    if (selectedParts.length === 0) {
      toast.error(t('noPartsSelected'));
      return;
    }

    setIsExporting(true);

    try {
      // Dynamic import to avoid SSR issues
      const { jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(t('pdfTitle'), pageWidth / 2, 20, { align: 'center' });

      // Subtitle
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(sectionName, pageWidth / 2, 28, { align: 'center' });

      // Machine info
      doc.setFontSize(10);
      doc.text(`${t('machine')}: ${machineName}`, 14, 40);
      doc.text(`${t('serialNumber')}: ${machineSerial}`, 14, 46);
      doc.text(`${t('date')}: ${new Date().toLocaleDateString()}`, 14, 52);
      doc.text(`${t('totalParts')}: ${selectedParts.length}`, 14, 58);

      // Table
      autoTable(doc, {
        startY: 65,
        head: [
          [
            t('tableHeaders.partNumber'),
            t('tableHeaders.description'),
            t('tableHeaders.quantity'),
            t('tableHeaders.unit'),
          ],
        ],
        body: selectedParts.map((part) => [
          part.partNumber,
          part.description,
          part.quantity.toFixed(2),
          part.unit,
        ]),
        theme: 'striped',
        headStyles: {
          fillColor: [249, 115, 22], // Orange-500
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [254, 243, 235], // Orange-50
        },
        styles: {
          fontSize: 10,
          cellPadding: 4,
        },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 25, halign: 'right' },
          3: { cellWidth: 20, halign: 'center' },
        },
      });

      // Footer
      const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
      doc.setFontSize(8);
      doc.setTextColor(128);
      doc.text(t('pdfFooter'), pageWidth / 2, finalY + 15, { align: 'center' });

      // Save
      const filename = `parts-replacement-${machineName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);

      toast.success(t('exportSuccess'));
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error(t('exportError'));
    } finally {
      setIsExporting(false);
    }
  }, [selectedParts, machineName, machineSerial, sectionName, t]);

  const allSelected = selectedPartNumbers.size === parts.length;
  const someSelected = selectedPartNumbers.size > 0 && !allSelected;

  return (
    <Card className="border-orange-200 dark:border-orange-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          {selectedPartNumbers.size > 0 && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
              {selectedPartNumbers.size} {t('selected')}
            </Badge>
          )}
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSelectAll} disabled={allSelected}>
              {t('selectAll')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeselectAll}
              disabled={selectedPartNumbers.size === 0}
            >
              {t('deselectAll')}
            </Button>
          </div>
          <Button
            onClick={exportToPDF}
            disabled={selectedPartNumbers.size === 0 || isExporting}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <FileDown className="h-4 w-4 mr-2" />
            {isExporting ? t('exporting') : t('exportPDF')}
          </Button>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={() => (allSelected ? handleDeselectAll() : handleSelectAll())}
                    aria-label={t('selectAll')}
                    className={someSelected ? 'data-[state=checked]:bg-orange-500' : ''}
                  />
                </TableHead>
                <TableHead className="font-semibold">{t('tableHeaders.partNumber')}</TableHead>
                <TableHead className="font-semibold">{t('tableHeaders.description')}</TableHead>
                <TableHead className="font-semibold text-right">
                  {t('tableHeaders.quantity')}
                </TableHead>
                <TableHead className="font-semibold text-center">
                  {t('tableHeaders.unit')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parts.map((part) => {
                const isSelected = selectedPartNumbers.has(part.partNumber);
                return (
                  <TableRow
                    key={part.partNumber}
                    className={`cursor-pointer transition-colors ${isSelected ? 'bg-orange-50 dark:bg-orange-950/20' : 'hover:bg-muted/50'}`}
                    onClick={() => handleTogglePart(part.partNumber)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleTogglePart(part.partNumber)}
                        aria-label={`Select ${part.description}`}
                        className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm">{part.partNumber}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {part.description}
                        {isSelected && <Check className="h-4 w-4 text-orange-500" />}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{part.quantity.toFixed(2)}</TableCell>
                    <TableCell className="text-center">{part.unit}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
