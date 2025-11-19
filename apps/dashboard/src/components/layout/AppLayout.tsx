'use client';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { AppHeader } from './AppHeader';
import { usePathname } from 'next/navigation';
import { BranchProvider } from '@/contexts/BranchContext';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noLayoutPaths = ['/', '/admin'];
  if (noLayoutPaths.includes(pathname)) {
    return <>{children}</>;
  }
  return (
    <BranchProvider>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
          <main className="flex-1 min-h-screen bg-background">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </BranchProvider>
  );
}
