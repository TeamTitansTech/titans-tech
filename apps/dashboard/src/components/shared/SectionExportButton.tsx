'use client';

import { useState, type RefObject } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

interface SectionExportButtonProps {
  contentRef: RefObject<HTMLDivElement | null>;
  sectionName: string;
  machineName: string;
}

// Convert SVG elements to canvas for better capture
async function convertSvgsToCanvas(container: HTMLElement): Promise<() => void> {
  const svgs = container.querySelectorAll('svg');
  const restoreFunctions: (() => void)[] = [];

  for (const svg of Array.from(svgs)) {
    try {
      // Get SVG dimensions
      const rect = svg.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;

      // Clone the SVG to avoid modifying the original
      const svgClone = svg.cloneNode(true) as SVGElement;

      // Ensure SVG has proper dimensions
      svgClone.setAttribute('width', String(rect.width));
      svgClone.setAttribute('height', String(rect.height));

      // Get computed styles and apply them inline
      const svgStyles = window.getComputedStyle(svg);
      svgClone.style.cssText = svgStyles.cssText;

      // Serialize SVG to string
      const svgData = new XMLSerializer().serializeToString(svgClone);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;

      // Set canvas size with scale for better quality
      const scale = 2;
      canvas.width = rect.width * scale;
      canvas.height = rect.height * scale;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      // Create image and draw to canvas
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          ctx.scale(scale, scale);
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          resolve();
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load SVG'));
        };
        img.src = url;
      });

      // Replace SVG with canvas
      const parent = svg.parentNode;
      if (parent) {
        parent.insertBefore(canvas, svg);
        svg.style.display = 'none';

        restoreFunctions.push(() => {
          svg.style.display = '';
          canvas.remove();
        });
      }
    } catch (error) {
      console.warn('Failed to convert SVG to canvas:', error);
    }
  }

  return () => {
    restoreFunctions.forEach((restore) => restore());
  };
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
    let restoreSvgs: (() => void) | null = null;

    try {
      const element = contentRef.current;

      // Store original styles
      const originalStyle = {
        height: element.style.height,
        overflow: element.style.overflow,
        maxHeight: element.style.maxHeight,
        position: element.style.position,
      };

      // Temporarily expand to show all content
      element.style.height = 'auto';
      element.style.overflow = 'visible';
      element.style.maxHeight = 'none';

      // Force layout recalculation
      void element.offsetHeight;

      // Wait for any chart animations to complete
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Convert SVGs to canvas for proper rendering
      restoreSvgs = await convertSvgsToCanvas(element);

      // Wait a bit more for canvas operations to complete
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Get the actual full dimensions after expansion
      const fullWidth = Math.max(element.scrollWidth, element.offsetWidth, element.clientWidth);
      const fullHeight = Math.max(element.scrollHeight, element.offsetHeight, element.clientHeight);

      const canvas = await html2canvas(element, {
        scale: 2, // Reduced scale for better performance
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: fullWidth,
        height: fullHeight,
        windowWidth: fullWidth,
        windowHeight: fullHeight,
        scrollX: 0,
        scrollY: 0,
        imageTimeout: 15000,
        onclone: (clonedDoc, clonedElement) => {
          // Ensure cloned element shows all content
          clonedElement.style.height = 'auto';
          clonedElement.style.overflow = 'visible';
          clonedElement.style.maxHeight = 'none';
          clonedElement.style.position = 'relative';

          // Hide all export buttons in the cloned document
          const exportButtons = clonedDoc.querySelectorAll('[data-export-button]');
          exportButtons.forEach((btn) => {
            (btn as HTMLElement).style.display = 'none';
          });

          // Convert date picker buttons to plain text
          const dateButtons = clonedDoc.querySelectorAll('button#date');
          dateButtons.forEach((btn) => {
            const button = btn as HTMLButtonElement;
            const textContent = button.textContent?.trim() || '-';
            const span = clonedDoc.createElement('span');
            span.textContent = textContent;
            span.style.cssText = 'font-size: 14px; font-weight: 500;';
            button.parentNode?.replaceChild(span, button);
          });
        },
      });

      // Restore SVGs immediately after capture
      if (restoreSvgs) {
        restoreSvgs();
        restoreSvgs = null;
      }

      // Restore original styles
      element.style.height = originalStyle.height;
      element.style.overflow = originalStyle.overflow;
      element.style.maxHeight = originalStyle.maxHeight;
      element.style.position = originalStyle.position;

      // Calculate dimensions - A4 landscape with pagination
      const pdfWidth = 297; // A4 landscape width in mm
      const pdfPageHeight = 210; // A4 landscape height in mm
      const margin = 15;
      const headerHeight = 20;
      const contentWidth = pdfWidth - 2 * margin;
      const contentPageHeight = pdfPageHeight - headerHeight - margin;

      // Calculate image scaling
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = contentWidth / imgWidth;
      const scaledHeight = imgHeight * ratio;

      // Determine number of pages needed
      const totalPages = Math.ceil(scaledHeight / contentPageHeight);

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      // Add content across pages
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }

        // Add simple header with title
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${machineName} - ${sectionName}`, margin, 12);

        // Add a subtle line under header
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.5);
        pdf.line(margin, headerHeight - 2, pdfWidth - margin, headerHeight - 2);

        // Calculate which portion of the image to draw
        const sourceY = (page * contentPageHeight) / ratio;
        const sourceHeight = Math.min(contentPageHeight / ratio, imgHeight - sourceY);
        const destHeight = sourceHeight * ratio;

        // Create a temporary canvas for this page's portion
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = imgWidth;
        tempCanvas.height = sourceHeight;
        const tempCtx = tempCanvas.getContext('2d');

        if (tempCtx) {
          tempCtx.drawImage(
            canvas,
            0,
            sourceY,
            imgWidth,
            sourceHeight,
            0,
            0,
            imgWidth,
            sourceHeight,
          );

          const pageImgData = tempCanvas.toDataURL('image/png', 1.0);
          pdf.addImage(pageImgData, 'PNG', margin, headerHeight, contentWidth, destHeight);
        }

        // Add page number in footer (only if multiple pages)
        if (totalPages > 1) {
          pdf.setTextColor(128, 128, 128);
          pdf.setFontSize(8);
          const pageText = `${page + 1} / ${totalPages}`;
          pdf.text(pageText, pdfWidth / 2 - pdf.getTextWidth(pageText) / 2, pdfPageHeight - 5);
        }
      }

      const filename = `${machineName}_${sectionName}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      pdf.save(filename);

      toast.success(t('exportedPDFSuccess'));
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error(t('exportPDFError'));
    } finally {
      // Ensure SVGs are restored even if there's an error
      if (restoreSvgs) {
        restoreSvgs();
      }
      setIsExporting(false);
    }
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
