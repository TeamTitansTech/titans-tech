'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { FileDown, Package, Check, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { Part, SectionWithTabs } from '@/data/parts/dac-parts';

interface PartsListSelectorBaseProps {
  title: string;
  description?: string;
  machineName?: string;
  machineSerial?: string;
  sectionName?: string;
  onSelectionChange?: (selectedParts: Part[]) => void;
}

interface PartsListSelectorWithParts extends PartsListSelectorBaseProps {
  parts: Part[];
  tabs?: never;
}

interface PartsListSelectorWithTabs extends PartsListSelectorBaseProps {
  parts?: never;
  tabs: SectionWithTabs;
}

export type PartsListSelectorProps = PartsListSelectorWithParts | PartsListSelectorWithTabs;

// Extracted table component for reuse in tabs
interface PartsTableProps {
  parts: Part[];
  isPartSelected: (partNumber: string) => boolean;
  onTogglePart: (partNumber: string) => void;
  hasActiveSearch: boolean;
  t: (key: string) => string;
}

function PartsTable({ parts, isPartSelected, onTogglePart, hasActiveSearch, t }: PartsTableProps) {
  return (
    <div className="max-h-[40vh] overflow-auto rounded-lg border">
      <Table className="relative">
        <TableHeader className="sticky top-0 z-10 bg-muted/50">
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead className="font-semibold">{t('tableHeaders.partNumber')}</TableHead>
            <TableHead className="font-semibold">{t('tableHeaders.description')}</TableHead>
            <TableHead className="text-right font-semibold">{t('tableHeaders.quantity')}</TableHead>
            <TableHead className="text-center font-semibold">{t('tableHeaders.unit')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                {hasActiveSearch ? t('noResultsFound') : t('noPartsAvailable')}
              </TableCell>
            </TableRow>
          ) : (
            parts.map((part, index) => {
              const isSelected = isPartSelected(part.partNumber);
              return (
                <TableRow
                  key={`${part.partNumber}-${index}`}
                  className={`cursor-pointer transition-colors ${isSelected ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-muted/50'}`}
                  onClick={() => onTogglePart(part.partNumber)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onTogglePart(part.partNumber)}
                      aria-label={`Select ${part.description}`}
                      className="data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm">{part.partNumber}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {part.description}
                      {isSelected && <Check className="h-4 w-4 text-primary" />}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{part.quantity}</TableCell>
                  <TableCell className="text-center">{part.unit}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export function PartsListSelector({
  parts,
  tabs,
  title,
  description,
  machineName = 'N/A',
  machineSerial = 'N/A',
  sectionName = 'Inspection',
  onSelectionChange,
}: PartsListSelectorProps) {
  const t = useTranslations('parts');
  // Selection keys are in format "tab:partNumber" to differentiate same parts in different tabs
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'outer' | 'inner'>('outer');

  // Determine which parts to use based on props
  // Only show tabs if both outer and inner have parts
  const hasTabs = !!tabs && tabs.outer.length > 0 && tabs.inner.length > 0;

  const currentTabParts = useMemo(() => {
    if (hasTabs && tabs) {
      return activeTab === 'outer' ? tabs.outer : tabs.inner;
    }
    // If tabs provided but only one has parts, return all available parts
    if (tabs) {
      return tabs.outer.length > 0 ? tabs.outer : tabs.inner;
    }
    return parts || [];
  }, [hasTabs, tabs, parts, activeTab]);

  // Helper to create selection key
  const getSelectionKey = useCallback(
    (partNumber: string, tab?: 'outer' | 'inner') => {
      if (hasTabs) {
        return `${tab || activeTab}:${partNumber}`;
      }
      return partNumber;
    },
    [hasTabs, activeTab],
  );

  // Check if a part is selected in current tab
  const isPartSelected = useCallback(
    (partNumber: string) => {
      return selectedKeys.has(getSelectionKey(partNumber));
    },
    [selectedKeys, getSelectionKey],
  );

  // Filter parts based on search query
  const filteredParts = useMemo(() => {
    if (searchQuery === '') return currentTabParts;
    return currentTabParts.filter(
      (part) =>
        part.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.description.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [currentTabParts, searchQuery]);

  const hasActiveSearch = searchQuery !== '';

  const handleTogglePart = useCallback(
    (partNumber: string) => {
      setSelectedKeys((prev) => {
        const key = getSelectionKey(partNumber);
        const newSet = new Set(prev);
        if (newSet.has(key)) {
          newSet.delete(key);
        } else {
          newSet.add(key);
        }

        // Notify parent of selection change - extract actual parts from keys
        if (onSelectionChange) {
          const selectedParts = getSelectedPartsFromKeys(newSet);
          onSelectionChange(selectedParts);
        }

        return newSet;
      });
    },
    [getSelectionKey, onSelectionChange],
  );

  // Helper to extract parts from selection keys
  const getSelectedPartsFromKeys = useCallback(
    (keys: Set<string>): Part[] => {
      const result: Part[] = [];
      keys.forEach((key) => {
        if (hasTabs && tabs) {
          const [tab, partNumber] = key.split(':');
          const tabParts = tab === 'outer' ? tabs.outer : tabs.inner;
          const part = tabParts.find((p) => p.partNumber === partNumber);
          if (part) result.push(part);
        } else {
          const part = (parts || []).find((p) => p.partNumber === key);
          if (part) result.push(part);
        }
      });
      return result;
    },
    [hasTabs, tabs, parts],
  );

  const selectedParts = useMemo(() => {
    return getSelectedPartsFromKeys(selectedKeys);
  }, [selectedKeys, getSelectedPartsFromKeys]);

  // Count selected parts per tab
  const outerSelectedCount = useMemo(() => {
    if (!hasTabs || !tabs) return 0;
    return tabs.outer.filter((p) => selectedKeys.has(`outer:${p.partNumber}`)).length;
  }, [hasTabs, tabs, selectedKeys]);

  const innerSelectedCount = useMemo(() => {
    if (!hasTabs || !tabs) return 0;
    return tabs.inner.filter((p) => selectedKeys.has(`inner:${p.partNumber}`)).length;
  }, [hasTabs, tabs, selectedKeys]);

  // Get selected parts separated by outer/inner for PDF export
  const selectedOuterParts = useMemo(() => {
    if (!hasTabs || !tabs) return [];
    return tabs.outer.filter((p) => selectedKeys.has(`outer:${p.partNumber}`));
  }, [hasTabs, tabs, selectedKeys]);

  const selectedInnerParts = useMemo(() => {
    if (!hasTabs || !tabs) return [];
    return tabs.inner.filter((p) => selectedKeys.has(`inner:${p.partNumber}`));
  }, [hasTabs, tabs, selectedKeys]);

  // Select all parts in current tab (or all parts if no tabs)
  const handleSelectAll = useCallback(() => {
    setSelectedKeys((prev) => {
      const newSet = new Set(prev);
      currentTabParts.forEach((part) => {
        newSet.add(getSelectionKey(part.partNumber));
      });

      if (onSelectionChange) {
        const selectedParts = getSelectedPartsFromKeys(newSet);
        onSelectionChange(selectedParts);
      }

      return newSet;
    });
  }, [currentTabParts, getSelectionKey, getSelectedPartsFromKeys, onSelectionChange]);

  // Clear all selected parts
  const handleClearAll = useCallback(() => {
    setSelectedKeys(new Set());
    if (onSelectionChange) {
      onSelectionChange([]);
    }
  }, [onSelectionChange]);

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

      const tableHeaders = [
        [
          t('tableHeaders.partNumber'),
          t('tableHeaders.description'),
          t('tableHeaders.quantity'),
          t('tableHeaders.unit'),
        ],
      ];

      const tableStyles = {
        theme: 'striped' as const,
        headStyles: {
          fillColor: [50, 50, 50] as [number, number, number],
          textColor: 255,
          fontStyle: 'bold' as const,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245] as [number, number, number],
        },
        styles: {
          fontSize: 10,
          cellPadding: 4,
        },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 'auto' as const },
          2: { cellWidth: 25, halign: 'right' as const },
          3: { cellWidth: 20, halign: 'center' as const },
        },
      };

      // Check if we have tabs and should separate outer/inner
      if (hasTabs && (selectedOuterParts.length > 0 || selectedInnerParts.length > 0)) {
        let currentY = 65;

        // Outer Slide section
        if (selectedOuterParts.length > 0) {
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text(`${t('outerSlide')} (${selectedOuterParts.length})`, 14, currentY);
          currentY += 5;

          autoTable(doc, {
            startY: currentY,
            head: tableHeaders,
            body: selectedOuterParts.map((part) => [
              part.partNumber,
              part.description,
              typeof part.quantity === 'number' ? part.quantity.toString() : part.quantity,
              part.unit,
            ]),
            ...tableStyles,
          });

          // Get the final Y position after the table
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          currentY = (doc as any).lastAutoTable.finalY + 15;
        }

        // Inner Slide section
        if (selectedInnerParts.length > 0) {
          // Check if we need a new page
          if (currentY > 250) {
            doc.addPage();
            currentY = 20;
          }

          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text(`${t('innerSlide')} (${selectedInnerParts.length})`, 14, currentY);
          currentY += 5;

          autoTable(doc, {
            startY: currentY,
            head: tableHeaders,
            body: selectedInnerParts.map((part) => [
              part.partNumber,
              part.description,
              typeof part.quantity === 'number' ? part.quantity.toString() : part.quantity,
              part.unit,
            ]),
            ...tableStyles,
          });
        }
      } else {
        // No tabs - single table with all parts
        autoTable(doc, {
          startY: 65,
          head: tableHeaders,
          body: selectedParts.map((part) => [
            part.partNumber,
            part.description,
            typeof part.quantity === 'number' ? part.quantity.toString() : part.quantity,
            part.unit,
          ]),
          ...tableStyles,
        });
      }

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
  }, [
    selectedParts,
    selectedOuterParts,
    selectedInnerParts,
    hasTabs,
    machineName,
    machineSerial,
    sectionName,
    t,
  ]);

  return (
    <Card className="flex h-full flex-col border-primary/20 dark:border-primary/30">
      <CardHeader className="shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          {selectedKeys.size > 0 && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {selectedKeys.size} {t('selected')}
            </Badge>
          )}
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col space-y-4 overflow-hidden">
        {/* Search Row */}
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            onClick={exportToPDF}
            disabled={selectedKeys.size === 0 || isExporting}
            className="bg-primary hover:bg-primary/90"
          >
            <FileDown className="mr-2 h-4 w-4" />
            {isExporting ? t('exporting') : t('exportPDF')}
          </Button>
        </div>

        {/* Select/Clear buttons */}
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            {t('selectAll')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            disabled={selectedKeys.size === 0}
          >
            {t('clearAll')}
          </Button>
        </div>

        {/* Tabs for Outer/Inner when available */}
        {hasTabs ? (
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as 'outer' | 'inner')}
            className="flex min-h-0 w-full flex-1 flex-col"
          >
            <TabsList className="mb-4 grid w-full shrink-0 grid-cols-2">
              <TabsTrigger value="outer" className="flex items-center gap-2">
                {t('outerSlide')}
                {outerSelectedCount > 0 && (
                  <Badge
                    variant="secondary"
                    className={`px-1.5 text-xs ${
                      activeTab === 'outer'
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {outerSelectedCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="inner" className="flex items-center gap-2">
                {t('innerSlide')}
                {innerSelectedCount > 0 && (
                  <Badge
                    variant="secondary"
                    className={`px-1.5 text-xs ${
                      activeTab === 'inner'
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {innerSelectedCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Results count */}
            {hasActiveSearch && (
              <div className="mb-2 text-sm text-muted-foreground">
                {t('showingResults', {
                  count: filteredParts.length,
                  total: currentTabParts.length,
                })}
              </div>
            )}

            <TabsContent value="outer" className="mt-0 flex min-h-0 flex-1 flex-col" tabIndex={-1}>
              <PartsTable
                parts={activeTab === 'outer' ? filteredParts : []}
                isPartSelected={isPartSelected}
                onTogglePart={handleTogglePart}
                hasActiveSearch={hasActiveSearch}
                t={t}
              />
            </TabsContent>
            <TabsContent value="inner" className="mt-0 flex min-h-0 flex-1 flex-col" tabIndex={-1}>
              <PartsTable
                parts={activeTab === 'inner' ? filteredParts : []}
                isPartSelected={isPartSelected}
                onTogglePart={handleTogglePart}
                hasActiveSearch={hasActiveSearch}
                t={t}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            {/* Results count */}
            {hasActiveSearch && (
              <div className="shrink-0 text-sm text-muted-foreground">
                {t('showingResults', {
                  count: filteredParts.length,
                  total: currentTabParts.length,
                })}
              </div>
            )}

            <PartsTable
              parts={filteredParts}
              isPartSelected={isPartSelected}
              onTogglePart={handleTogglePart}
              hasActiveSearch={hasActiveSearch}
              t={t}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
