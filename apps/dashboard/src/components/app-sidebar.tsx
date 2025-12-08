'use client';

import * as React from 'react';
import {
  LayoutDashboard,
  Wrench,
  FolderKanban,
  Users,
  User,
  ClipboardList,
  Shield,
  Building2,
  Factory,
  Settings,
  AlertCircle,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useSysAdmin } from '@/contexts/SysAdminContext';
import { useCompanyUser } from '@/contexts/CompanyUserContext';
import { useTheme } from '@/contexts/ThemeContext';
import { hasPermissionInAnyBranch } from '@titans-tech/shared/types';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const t = useTranslations();
  const { sysAdminUser } = useSysAdmin();
  const { companyUser } = useCompanyUser();
  const { companyInfo } = useTheme();
  const { setOpenMobile, isMobile } = useSidebar();

  // Close sidebar on mobile when navigating
  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  // Check if we're on an admin route or if sysAdminUser is set
  const isAdmin = pathname.startsWith('/admin') || !!sysAdminUser;

  // Get the company logo URL from theme context (only for client/company routes)
  const companyLogo = !isAdmin ? companyInfo?.logo : null;

  // Helper function to check if a navigation item is active
  const checkIsActive = (itemUrl: string, itemTitle: string) => {
    // Standard check: exact match or starts with the URL
    const standardCheck = pathname === itemUrl || pathname.startsWith(`${itemUrl}/`);

    // Special case for Machines tab: also highlight when viewing machine detail pages
    if (itemTitle === t('navigation.allMachines')) {
      // Highlight when on machine detail pages (both /machines/[id] and /admin/machines/[id])
      if (pathname.startsWith('/machines/') || pathname === '/machines') {
        return true;
      }
    }

    return standardCheck;
  };

  // Admin navigation
  const adminData = {
    company: {
      name: t('navigation.adminPortal'),
      subtitle: t('navigation.systemAdministration'),
      logo: Shield,
    },
    navMain: [
      {
        title: t('navigation.dashboard'),
        icon: LayoutDashboard,
        url: '/admin/dashboard',
      },
      {
        title: t('navigation.models'),
        icon: FolderKanban,
        url: '/admin/blueprints',
      },
      {
        title: t('navigation.companies'),
        icon: Users,
        url: '/admin/companies',
      },
      {
        title: t('navigation.allMachines'),
        icon: Wrench,
        url: '/admin/machines',
      },
      {
        title: t('navigation.productionLines'),
        icon: Factory,
        url: '/admin/production-lines',
      },
      {
        title: t('navigation.services'),
        icon: ClipboardList,
        url: '/admin/services',
      },
      {
        title: t('serviceRequests.title'),
        icon: AlertCircle,
        url: '/admin/service-requests',
      },
      {
        title: t('navigation.settings'),
        icon: Settings,
        url: '/admin/settings',
      },
    ],
  };

  // Client navigation
  const clientData = React.useMemo(
    () => ({
      company: {
        name: t('common.companyName'),
        subtitle: t('common.companySubtitle'),
        logo: Wrench,
      },
      navMain: [
        {
          title: t('navigation.dashboard'),
          icon: LayoutDashboard,
          url: '/home',
        },
        {
          title: t('navigation.company'),
          icon: Building2,
          url: '/company',
        },
        {
          title: t('navigation.allMachines'),
          icon: Wrench,
          url: '/machines',
        },
        {
          title: t('navigation.productionLines'),
          icon: Factory,
          url: '/production-lines',
        },
        {
          title: t('navigation.services'),
          icon: ClipboardList,
          url: '/services',
        },
        {
          title: t('navigation.settings'),
          icon: Settings,
          url: '/settings',
        },
      ],
    }),
    [t],
  );

  // Filter client navigation based on permissions
  const filteredClientData = React.useMemo(() => {
    if (isAdmin) return clientData;

    // Company admins see everything (hasPermissionInAnyBranch already handles this)
    if (companyUser?.isCompanyAdmin) {
      return clientData;
    }

    // For regular users, filter based on permissions
    const filteredNavMain = clientData.navMain.filter((item) => {
      // Check permissions for specific routes
      if (item.url === '/machines') {
        return hasPermissionInAnyBranch(companyUser, 'readMachines');
      }
      if (item.url === '/services') {
        return hasPermissionInAnyBranch(companyUser, 'readServices');
      }
      if (item.url === '/production-lines') {
        return hasPermissionInAnyBranch(companyUser, 'readProductionLines');
      }
      return true;
    });

    return {
      ...clientData,
      navMain: filteredNavMain,
    };
  }, [isAdmin, companyUser, clientData]);

  const data = isAdmin ? adminData : filteredClientData;
  const dashboardUrl = isAdmin ? '/admin/dashboard' : '/home';

  return (
    <Sidebar collapsible="offcanvas" className="shadow-lg" {...props}>
      <SidebarHeader className="p-5 border-b border-slate-700/50">
        <Link href={dashboardUrl} className="flex items-center gap-3">
          {companyLogo ? (
            <div className="relative aspect-square size-10 rounded-lg overflow-hidden bg-white/10 shrink-0">
              <Image
                src={companyLogo}
                alt={companyInfo?.name || 'Company Logo'}
                fill
                className="object-contain p-1"
              />
            </div>
          ) : (
            <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground shrink-0">
              <data.company.logo className="size-6" />
            </div>
          )}
          <div className="grid flex-1 text-left leading-tight min-w-0">
            <span className="truncate font-bold text-base text-white">
              {!isAdmin && companyInfo?.name ? companyInfo.name : data.company.name}
            </span>
            <span className="truncate text-[10px] uppercase tracking-wider font-medium text-gray-500">
              {data.company.subtitle}
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-2 py-6">
        <SidebarGroup className="px-0">
          <SidebarMenu className="space-y-2.5">
            {data.navMain.map((item) => {
              const isActive = checkIsActive(item.url, item.title);
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isActive}
                    className={
                      isActive
                        ? 'bg-accent/15 text-accent hover:bg-accent/30 border-l-4 border-accent rounded-l-none font-bold transition-all duration-200'
                        : 'text-white hover:bg-accent/20 hover:text-accent border-l-4 border-transparent hover:border-accent/50 rounded-l-none font-medium transition-all duration-200'
                    }
                  >
                    <Link
                      href={item.url}
                      onClick={handleLinkClick}
                      className="flex items-center gap-4 px-4 py-3.5"
                    >
                      <item.icon className="size-5 shrink-0" />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-slate-700/50 p-3">
        <div className="flex items-center gap-3">
          <div className="flex aspect-square size-12 items-center justify-center rounded-lg bg-accent/20 text-accent shrink-0">
            <User className="size-6" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold text-white text-sm">
              {isAdmin && sysAdminUser
                ? sysAdminUser.email || 'Admin User'
                : companyUser
                  ? companyUser.name || 'Company User'
                  : 'User'}
            </span>
            <span className="truncate text-xs text-gray-400">
              {isAdmin && sysAdminUser
                ? sysAdminUser.email
                : companyUser
                  ? companyUser.email
                  : 'Loading...'}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
