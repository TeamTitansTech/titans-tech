'use client';

import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, QrCode, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getMachineQRUrl } from '@/lib/qrcode';
import { useTranslations } from 'next-intl';

interface QRCodeGeneratorProps {
  machineId: string;
  machineName: string;
  companySlug: string;
}

export function QRCodeGenerator({ machineId, machineName, companySlug }: QRCodeGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const svgRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('machines.qrCode');

  const qrUrl = getMachineQRUrl(machineId, companySlug);

  const handleDownloadSVG = () => {
    const svgElement = svgRef.current?.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `qr-${machineName.replace(/\s+/g, '-').toLowerCase()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPNG = () => {
    const svgElement = svgRef.current?.querySelector('svg');
    if (!svgElement) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const img = new Image();

    img.onload = () => {
      canvas.width = 512;
      canvas.height = 512;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, 512, 512);

      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = `qr-${machineName.replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <QrCode className="h-4 w-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>{t('generateQR')}</TooltipContent>
      </Tooltip>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="text-center">
          <DialogTitle className="flex items-center justify-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            {t('title')}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground text-center">
            {t('description', { machineName })}
          </p>

          <div ref={svgRef} className="bg-white p-4 rounded-lg border shadow-sm">
            <QRCodeSVG
              value={qrUrl}
              size={180}
              level="H"
              includeMargin={true}
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>

          <Button variant="outline" onClick={handleCopyUrl} className="gap-2">
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-500" />
                {t('copied')}
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                {t('copyLink')}
              </>
            )}
          </Button>

          <div className="flex gap-2 w-full">
            <Button variant="outline" className="flex-1" onClick={handleDownloadSVG}>
              <Download className="h-4 w-4 mr-2" />
              {t('downloadSVG')}
            </Button>
            <Button
              variant="default"
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={handleDownloadPNG}
            >
              <Download className="h-4 w-4 mr-2" />
              {t('downloadPNG')}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">{t('instructions')}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
