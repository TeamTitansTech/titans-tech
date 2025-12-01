'use client';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { AppHeader } from './AppHeader';
import { usePathname } from 'next/navigation';
import { NotificationsSocketProvider } from '@/contexts/NotificationsSocketContext';
import { useCompanyUser } from '@/contexts/CompanyUserContext';
import { useSysAdmin } from '@/contexts/SysAdminContext';
import { BranchProvider } from '@/contexts/BranchContext';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noLayoutPaths = ['/', '/admin'];
  const { companyUser } = useCompanyUser();
  const { sysAdminUser } = useSysAdmin();

  // Get user ID and unread notifications from either context
  const userId = companyUser?.id || sysAdminUser?.id;
  const unreadNotifications =
    companyUser?.unreadNotifications || sysAdminUser?.unreadNotifications || 0;

  if (noLayoutPaths.includes(pathname)) {
    return <>{children}</>;
  }
  return (
    <NotificationsSocketProvider userId={userId} initialUnreadCount={unreadNotifications}>
      <BranchProvider>
        <SidebarProvider defaultOpen={true}>
          <AppSidebar />
          <SidebarInset className="min-w-0 overflow-hidden">
            <AppHeader />
            <div className="flex-1 min-h-screen bg-background overflow-auto">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </BranchProvider>
    </NotificationsSocketProvider>
  );
}
