import { TooltipProvider } from '@/components/ui/tooltip';

/**
 * Isolated layout for QR code public pages.
 * This layout does NOT include the AppLayout (sidebar/header)
 * because it's meant for unauthenticated users scanning QR codes.
 */
export default function QRLayout({ children }: { children: React.ReactNode }) {
  return <TooltipProvider>{children}</TooltipProvider>;
}
