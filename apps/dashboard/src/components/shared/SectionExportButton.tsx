'use client';

import { useState, type RefObject } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { exportToPDF } from '@/lib/pdfExport';

interface SectionExportButtonProps {
  contentRef: RefObject<HTMLDivElement | null>;
  sectionName: string;
  machineName: string;
}

export function SectionExportButton({
  contentRef,
  sectionName,
  machineName,
}: SectionExportButtonProps) {
  const t = useTranslations('machines.sectionDetails');
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    if (!contentRef.current) {
      toast.error(t('exportPDFError'));
      return;
    }

    setIsExporting(true);

    const result = await exportToPDF({
      element: contentRef.current,
      title: `${machineName} - ${sectionName}`,
      filename: `${machineName}_${sectionName}`,
      convertSvgs: true, // Section pages have Recharts SVGs
    });

    if (result.success) {
      toast.success(t('exportedPDFSuccess'));
    } else {
      console.error('Error exporting to PDF:', result.error);
      toast.error(t('exportPDFError'));
    }

    setIsExporting(false);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExportPDF}
      disabled={isExporting}
      className="focus-visible:ring-0 focus-visible:ring-offset-0"
      data-export-button
    >
      {isExporting ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <FileDown className="w-4 h-4 mr-2" />
      )}
      {t('exportAsPDF')}
    </Button>
  );
}
