'use client';

import { useState, useRef, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Printer, Copy, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  generateMachineQRCodeUrl,
  downloadQRCodeAsPNG,
  printQRCode,
  copyQRCodeUrlToClipboard,
} from '@/lib/qrcode';

interface QRCodeGeneratorProps {
  machineId: string;
  machineName: string;
  machineSerialNumber?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function QRCodeGenerator({
  machineId,
  machineName,
  machineSerialNumber,
  variant = 'outline',
  size = 'default',
}: QRCodeGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const qrCodeUrl = generateMachineQRCodeUrl(machineId);

  const handleDownload = () => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;

    const filename = `qrcode-${machineName.replace(/\s+/g, '-').toLowerCase()}`;
    downloadQRCodeAsPNG(canvas, filename);
    toast.success('QR Code baixado com sucesso!');
  };

  const handlePrint = () => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;

    printQRCode(canvas, {
      name: machineName,
      serialNumber: machineSerialNumber,
    });
  };

  const handleCopyUrl = async () => {
    try {
      await copyQRCodeUrlToClipboard(machineId);
      toast.success('URL copiada para a área de transferência!');
    } catch (error) {
      toast.error('Erro ao copiar URL');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size}>
          <QrCode className="h-4 w-4 mr-2" />
          Gerar QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code - {machineName}</DialogTitle>
          <DialogDescription>
            Escaneie este QR code para acessar rapidamente os detalhes da máquina.
            {machineSerialNumber && (
              <>
                <br />
                <span className="text-xs">S/N: {machineSerialNumber}</span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4 py-4">
          {/* QR Code */}
          <div ref={canvasRef} className="bg-white p-4 rounded-lg border-2 border-gray-200">
            <QRCodeCanvas value={qrCodeUrl} size={256} level="H" includeMargin={true} />
          </div>

          {/* URL Display */}
          <div className="w-full">
            <p className="text-xs text-gray-500 mb-1">URL do QR Code:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-gray-100 px-3 py-2 rounded border border-gray-200 overflow-x-auto">
                {qrCodeUrl}
              </code>
              <Button variant="ghost" size="icon" onClick={handleCopyUrl} title="Copiar URL">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 w-full">
            <Button onClick={handleDownload} variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Baixar PNG
            </Button>
            <Button onClick={handlePrint} variant="outline" className="flex-1">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </div>

          {/* Info */}
          <div className="text-xs text-gray-500 text-center mt-2">
            <p>Este QR code redireciona automaticamente baseado no tipo de usuário:</p>
            <ul className="mt-2 space-y-1 text-left">
              <li>• Administradores → Painel Admin</li>
              <li>• Usuários da empresa → Dashboard da empresa</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
