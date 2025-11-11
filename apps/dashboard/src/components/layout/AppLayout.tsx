'use client';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { AppHeader } from './AppHeader';
import { usePathname } from '@/i18n/routing';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noLayoutPaths = ['/'];
  if (noLayoutPaths.includes(pathname)) {
    return <>{children}</>;
  }
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 min-h-screen bg-background">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
