'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { AppHeader } from './AppHeader';
import { usePathname } from 'next/navigation';


export function AppLayout({ children }: { children: React.ReactNode }) {
 const currentPath = usePathname();
  const ignoredPaths = ["/"];

  if(ignoredPaths.includes(currentPath)) {
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
