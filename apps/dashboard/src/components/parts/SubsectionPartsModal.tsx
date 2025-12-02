'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Package,
  FileDown,
  Search,
  X,
  Check,
  ImageOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Subsection } from '@/data/parts/section-subsections';
import type { Part } from '@/data/parts/dac-parts';

interface SubsectionPartsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subsections: Subsection[];
  machineName?: string;
  machineSerial?: string;
  sectionName?: string;
}

export function SubsectionPartsModal({
  isOpen,
  onClose,
  title,
  subsections,
  machineName = 'N/A',
  machineSerial = 'N/A',
  sectionName = 'Inspection',
}: SubsectionPartsModalProps) {
  const t = useTranslations('parts');
  const tSubsections = useTranslations('parts.subsections');

  const [activeTab, setActiveTab] = useState(subsections[0]?.id || '');
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [imageError, setImageError] = useState<Record<string, boolean>>({});

  // Get the active subsection
  const activeSubsection = useMemo(
    () => subsections.find((s) => s.id === activeTab) || subsections[0],
    [subsections, activeTab],
  );

  // Filter parts based on search query
  const filteredParts = useMemo(() => {
    if (!activeSubsection) return [];
    if (searchQuery === '') return activeSubsection.parts;
    return activeSubsection.parts.filter(
      (part) =>
        part.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.description.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [activeSubsection, searchQuery]);

  // Helper to create selection key
  const getSelectionKey = useCallback(
    (partNumber: string) => `${activeTab}:${partNumber}`,
    [activeTab],
  );

  // Check if a part is selected
  const isPartSelected = useCallback(
    (partNumber: string) => selectedKeys.has(getSelectionKey(partNumber)),
    [selectedKeys, getSelectionKey],
  );

  // Toggle part selection
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
        return newSet;
      });
    },
    [getSelectionKey],
  );

  // Select all parts in current tab
  const handleSelectAll = useCallback(() => {
    setSelectedKeys((prev) => {
      const newSet = new Set(prev);
      filteredParts.forEach((part) => {
        newSet.add(getSelectionKey(part.partNumber));
      });
      return newSet;
    });
  }, [filteredParts, getSelectionKey]);

  // Clear all selected parts in current tab only
  const handleClearAll = useCallback(() => {
    setSelectedKeys((prev) => {
      const newSet = new Set(prev);
      // Only remove keys that belong to the current active tab
      activeSubsection?.parts.forEach((part) => {
        newSet.delete(`${activeTab}:${part.partNumber}`);
      });
      return newSet;
    });
  }, [activeTab, activeSubsection]);

  // Get all selected parts across all subsections
  const getAllSelectedParts = useCallback((): { subsectionName: string; parts: Part[] }[] => {
    const result: { subsectionName: string; parts: Part[] }[] = [];

    subsections.forEach((subsection) => {
      const selectedInSubsection = subsection.parts.filter((part) =>
        selectedKeys.has(`${subsection.id}:${part.partNumber}`),
      );
      if (selectedInSubsection.length > 0) {
        result.push({
          subsectionName: getSubsectionName(subsection.id),
          parts: selectedInSubsection,
        });
      }
    });

    return result;
  }, [subsections, selectedKeys]);

  // Get subsection name from translation or fallback
  const getSubsectionName = useCallback(
    (subsectionId: string) => {
      const subsection = subsections.find((s) => s.id === subsectionId);
      if (!subsection) return subsectionId;
      try {
        // Extract the key after 'subsections.'
        const key = subsection.nameKey.replace('subsections.', '');
        return tSubsections(key);
      } catch {
        return subsection.nameKey;
      }
    },
    [subsections, tSubsections],
  );

  // Count selected parts in a subsection
  const getSelectedCountForSubsection = useCallback(
    (subsectionId: string) => {
      const subsection = subsections.find((s) => s.id === subsectionId);
      if (!subsection) return 0;
      return subsection.parts.filter((p) => selectedKeys.has(`${subsectionId}:${p.partNumber}`))
        .length;
    },
    [subsections, selectedKeys],
  );

  // Get selected parts for current subsection only
  const getCurrentSubsectionSelectedParts = useCallback((): {
    subsectionName: string;
    parts: Part[];
  }[] => {
    if (!activeSubsection) return [];
    const selectedInSubsection = activeSubsection.parts.filter((part) =>
      selectedKeys.has(`${activeTab}:${part.partNumber}`),
    );
    if (selectedInSubsection.length === 0) return [];
    return [
      {
        subsectionName: getSubsectionName(activeTab),
        parts: selectedInSubsection,
      },
    ];
  }, [activeSubsection, activeTab, selectedKeys, getSubsectionName]);

  // Export to PDF - can export current subsection or all
  const exportToPDF = useCallback(
    async (mode: 'current' | 'all') => {
      const partsToExport =
        mode === 'current' ? getCurrentSubsectionSelectedParts() : getAllSelectedParts();

      if (partsToExport.length === 0) {
        toast.error(t('noPartsSelected'));
        return;
      }

      setIsExporting(true);

      try {
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

        const totalParts = partsToExport.reduce((sum, group) => sum + group.parts.length, 0);
        doc.text(`${t('totalParts')}: ${totalParts}`, 14, 58);

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

        let currentY = 65;

        // Add each subsection
        for (const group of partsToExport) {
          // Check if we need a new page
          if (currentY > 250) {
            doc.addPage();
            currentY = 20;
          }

          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text(`${group.subsectionName} (${group.parts.length})`, 14, currentY);
          currentY += 5;

          autoTable(doc, {
            startY: currentY,
            head: tableHeaders,
            body: group.parts.map((part) => [
              part.partNumber,
              part.description,
              typeof part.quantity === 'number' ? part.quantity.toString() : part.quantity,
              part.unit,
            ]),
            ...tableStyles,
          });

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          currentY = (doc as any).lastAutoTable.finalY + 15;
        }

        // Save
        const subsectionSuffix = mode === 'current' ? `-${activeTab}` : '-all';
        const filename = `parts-replacement-${machineName.replace(/\s+/g, '-')}${subsectionSuffix}-${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);

        toast.success(t('exportSuccess'));
      } catch (error) {
        console.error('Error exporting PDF:', error);
        toast.error(t('exportError'));
      } finally {
        setIsExporting(false);
      }
    },
    [
      getAllSelectedParts,
      getCurrentSubsectionSelectedParts,
      machineName,
      machineSerial,
      sectionName,
      activeTab,
      t,
    ],
  );

  const handleImageError = useCallback((subsectionId: string) => {
    setImageError((prev) => ({ ...prev, [subsectionId]: true }));
  }, []);

  if (subsections.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="h-[90vh] max-h-[90vh] overflow-hidden w-[95vw] max-w-[1600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full flex-1 flex flex-col min-h-0"
        >
          {/* Tabs List - Centered and Scrollable for many subsections */}
          <div className="overflow-x-auto pb-2 shrink-0 flex justify-center">
            <div className="inline-flex gap-2 p-1 bg-muted rounded-lg">
              {subsections.map((subsection) => {
                const selectedCount = getSelectedCountForSubsection(subsection.id);
                const fullName = getSubsectionName(subsection.id);
                const isActive = activeTab === subsection.id;
                return (
                  <button
                    key={subsection.id}
                    onClick={() => setActiveTab(subsection.id)}
                    className={cn(
                      'flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-md text-sm font-medium transition-all',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-transparent text-muted-foreground hover:bg-background hover:text-foreground',
                    )}
                  >
                    <span>{fullName}</span>
                    {selectedCount > 0 && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          'text-xs px-1.5',
                          isActive
                            ? 'bg-primary-foreground/20 text-primary-foreground'
                            : 'bg-primary/10 text-primary',
                        )}
                      >
                        {selectedCount}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          {subsections.map((subsection) => (
            <TabsContent key={subsection.id} value={subsection.id} className="mt-4 flex-1 min-h-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-hidden">
                {/* Diagram Image */}
                <div className="flex flex-col h-full min-h-0 overflow-hidden">
                  <div className="flex items-center justify-between shrink-0">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {subsection.figureReference || 'Technical Diagram'}
                      <span className="ml-2 text-xs text-muted-foreground">
                        (Scroll to zoom, drag to pan)
                      </span>
                    </h3>
                  </div>
                  <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-900 relative flex-1 mt-2 min-h-0">
                    {subsection.diagramImage && !imageError[subsection.id] ? (
                      <TransformWrapper
                        initialScale={1}
                        minScale={0.5}
                        maxScale={4}
                        centerOnInit
                        wheel={{ step: 0.1 }}
                        doubleClick={{ mode: 'zoomIn' }}
                      >
                        {({ zoomIn, zoomOut, resetTransform }) => (
                          <>
                            {/* Zoom Controls */}
                            <div className="absolute top-2 right-2 z-10 flex gap-1 bg-white dark:bg-gray-800 rounded-md shadow-md p-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => zoomIn()}
                                title="Zoom in"
                              >
                                <ZoomIn className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => zoomOut()}
                                title="Zoom out"
                              >
                                <ZoomOut className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => resetTransform()}
                                title="Reset"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Zoomable Image */}
                            <TransformComponent
                              wrapperStyle={{
                                width: '100%',
                                height: '100%',
                                cursor: 'grab',
                              }}
                              contentStyle={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Image
                                src={subsection.diagramImage!}
                                alt={`${getSubsectionName(subsection.id)} diagram`}
                                width={800}
                                height={600}
                                className="max-w-full max-h-full object-contain"
                                priority
                                unoptimized
                                draggable={false}
                                onError={() => handleImageError(subsection.id)}
                              />
                            </TransformComponent>
                          </>
                        )}
                      </TransformWrapper>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <ImageOff className="h-16 w-16 mb-4 opacity-50" />
                        <p className="text-sm">Image not available</p>
                        <p className="text-xs mt-1">
                          {subsection.diagramImage
                            ? 'Image will be added soon'
                            : 'No diagram for this subsection'}
                        </p>
                      </div>
                    )}
                  </div>
                  {subsection.description && (
                    <p className="text-sm text-muted-foreground shrink-0 mt-2">
                      {subsection.description}
                    </p>
                  )}
                </div>

                {/* Parts List */}
                <div className="flex flex-col h-full min-h-0 overflow-hidden">
                  <Card className="border-primary/20 dark:border-primary/30 flex flex-col flex-1 min-h-0">
                    <CardHeader className="pb-3 shrink-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="h-5 w-5 text-primary" />
                          <CardTitle className="text-lg">{t('partsListTitle')}</CardTitle>
                        </div>
                        {selectedKeys.size > 0 && (
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            {selectedKeys.size} {t('selected')}
                          </Badge>
                        )}
                      </div>
                      <CardDescription>
                        {subsection.parts.length} {t('partsAvailable')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1 flex flex-col overflow-hidden">
                      {/* Search Row */}
                      <div className="relative shrink-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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

                      {/* Export This Tab Button */}
                      <div className="shrink-0">
                        <Button
                          onClick={() => exportToPDF('current')}
                          disabled={getSelectedCountForSubsection(activeTab) === 0 || isExporting}
                          variant="outline"
                          size="sm"
                        >
                          <FileDown className="h-4 w-4 mr-2" />
                          {t('exportThisTab') || 'Export This Tab'}
                          {getSelectedCountForSubsection(activeTab) > 0 &&
                            ` (${getSelectedCountForSubsection(activeTab)})`}
                        </Button>
                      </div>

                      {/* Select/Clear buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Button variant="outline" size="sm" onClick={handleSelectAll}>
                          {t('selectAll')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleClearAll}
                          disabled={getSelectedCountForSubsection(activeTab) === 0}
                        >
                          {t('clearAll')}
                        </Button>
                      </div>

                      {/* Parts Table */}
                      <div className="border rounded-lg overflow-hidden flex-1 overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead className="w-12"></TableHead>
                              <TableHead className="font-semibold">
                                {t('tableHeaders.partNumber')}
                              </TableHead>
                              <TableHead className="font-semibold">
                                {t('tableHeaders.description')}
                              </TableHead>
                              <TableHead className="font-semibold text-right">
                                {t('tableHeaders.quantity')}
                              </TableHead>
                              <TableHead className="font-semibold text-center">
                                {t('tableHeaders.unit')}
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredParts.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={5}
                                  className="h-24 text-center text-muted-foreground"
                                >
                                  {searchQuery ? t('noResultsFound') : t('noPartsAvailable')}
                                </TableCell>
                              </TableRow>
                            ) : (
                              filteredParts.map((part, index) => {
                                const isSelected = isPartSelected(part.partNumber);
                                return (
                                  <TableRow
                                    key={`${part.partNumber}-${index}`}
                                    className="cursor-pointer transition-colors hover:bg-muted/50"
                                    onClick={() => handleTogglePart(part.partNumber)}
                                  >
                                    <TableCell>
                                      <div
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleTogglePart(part.partNumber);
                                        }}
                                        className={cn(
                                          'w-5 h-5 rounded flex items-center justify-center cursor-pointer border-2',
                                          isSelected
                                            ? 'bg-primary border-primary'
                                            : 'bg-transparent border-gray-400',
                                        )}
                                      >
                                        {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                                      </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">
                                      {part.partNumber}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <span>{part.description}</span>
                                        {isSelected && (
                                          <Check className="h-4 w-4 text-primary shrink-0" />
                                        )}
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
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Footer with Export All Tabs button */}
        <DialogFooter className="border-t pt-4 mt-4 shrink-0">
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-muted-foreground">
              {selectedKeys.size > 0
                ? `${selectedKeys.size} ${t('partsSelectedAcrossTabs')}`
                : t('selectPartsToExport')}
            </p>
            <Button
              onClick={() => exportToPDF('all')}
              disabled={selectedKeys.size === 0 || isExporting}
              className="bg-primary hover:bg-primary/90"
            >
              <FileDown className="h-4 w-4 mr-2" />
              {t('exportAllTabs') || 'Export All Tabs'}
              {selectedKeys.size > 0 && ` (${selectedKeys.size})`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
