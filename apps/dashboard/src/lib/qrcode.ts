/**
 * Generates a QR code URL for a machine
 * @param machineId - The ID of the machine
 * @returns The full URL to be encoded in the QR code
 */
export function generateMachineQRCodeUrl(machineId: string): string {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';

  return `${protocol}://${rootDomain}/qr/${machineId}`;
}

/**
 * Downloads a QR code as a PNG image
 * @param canvas - The canvas element containing the QR code
 * @param filename - The filename for the downloaded image
 */
export function downloadQRCodeAsPNG(canvas: HTMLCanvasElement, filename: string): void {
  const url = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = url;
  link.click();
}

/**
 * Prints a QR code
 * @param canvas - The canvas element containing the QR code
 * @param machineInfo - Optional machine information to display on the print
 */
export function printQRCode(
  canvas: HTMLCanvasElement,
  machineInfo?: { name: string; serialNumber?: string },
): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const dataUrl = canvas.toDataURL('image/png');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>QR Code - ${machineInfo?.name || 'Machine'}</title>
        <style>
          body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            font-family: Arial, sans-serif;
          }
          .qr-container {
            text-align: center;
            padding: 40px;
          }
          .machine-info {
            margin-bottom: 20px;
          }
          .machine-info h2 {
            margin: 0 0 10px 0;
            font-size: 24px;
          }
          .machine-info p {
            margin: 0;
            color: #666;
            font-size: 14px;
          }
          img {
            max-width: 400px;
            height: auto;
          }
          .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #999;
          }
          @media print {
            body {
              background: white;
            }
          }
        </style>
      </head>
      <body>
        <div class="qr-container">
          ${
            machineInfo
              ? `
            <div class="machine-info">
              <h2>${machineInfo.name}</h2>
              ${machineInfo.serialNumber ? `<p>S/N: ${machineInfo.serialNumber}</p>` : ''}
            </div>
          `
              : ''
          }
          <img src="${dataUrl}" alt="QR Code" />
          <div class="footer">
            <p>Scan to access machine details</p>
          </div>
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };
}

/**
 * Copies the QR code URL to clipboard
 * @param machineId - The machine ID
 * @returns Promise that resolves when copied
 */
export async function copyQRCodeUrlToClipboard(machineId: string): Promise<void> {
  const url = generateMachineQRCodeUrl(machineId);
  await navigator.clipboard.writeText(url);
}
