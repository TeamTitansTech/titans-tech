'use client';

import * as React from 'react';
import {
  LayoutDashboard,
  Wrench,
  FolderKanban,
  Users,
  User,
  Settings,
  ClipboardList,
  Shield,
  Building2,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useSysAdmin } from '@/contexts/SysAdminContext';
import { BranchSelector } from './layout/BranchSelector';
import { useCompanyUser } from '@/contexts/CompanyUserContext';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const t = useTranslations();
  const { sysAdminUser } = useSysAdmin();
  const { companyUser } = useCompanyUser();

  // Check if we're on an admin route or if sysAdminUser is set
  const isAdmin = pathname.startsWith('/admin') || !!sysAdminUser;

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
    ],
    navUtility: [
      {
        title: t('navigation.settings'),
        icon: Settings,
        url: '/admin/settings',
      },
    ],
  };

  // Client navigation
  const clientData = {
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
        title: t('navigation.services'),
        icon: ClipboardList,
        url: '/services',
      },
    ],
    navUtility: [
      {
        title: t('navigation.settings'),
        icon: Settings,
        url: '/settings',
      },
    ],
  };

  const data = isAdmin ? adminData : clientData;
  const dashboardUrl = isAdmin ? '/admin/dashboard' : '/home';

  return (
    <Sidebar collapsible="offcanvas" className="shadow-lg" {...props}>
      <SidebarHeader className="p-5 border-b border-slate-700/50">
        <Link href={dashboardUrl} className="flex items-center gap-3">
          <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-orange-500 text-white shrink-0">
            <data.company.logo className="size-6" />
          </div>
          <div className="grid flex-1 text-left leading-tight min-w-0">
            <span className="truncate font-bold text-base text-white">{data.company.name}</span>
            <span className="truncate text-[10px] uppercase tracking-wider font-medium text-gray-500">
              {data.company.subtitle}
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-2 py-6">
        {!isAdmin && (
          <div className="px-4 pb-4 border-b border-slate-700/50 mb-4">
            <BranchSelector />
          </div>
        )}
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
                        ? 'bg-orange-500/15 text-orange-400 hover:bg-orange-500/30 border-l-4 border-orange-500 rounded-l-none font-bold transition-all duration-200'
                        : 'text-white hover:bg-orange-500/20 hover:text-orange-400 border-l-4 border-transparent hover:border-orange-500/50 rounded-l-none font-medium transition-all duration-200'
                    }
                  >
                    <Link href={item.url} className="flex items-center gap-4 px-4 py-3.5">
                      <item.icon className="size-5 shrink-0" />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="px-0 mt-6">
          <SidebarMenu>
            {data.navUtility.map((item) => {
              const isActive = checkIsActive(item.url, item.title);
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isActive}
                    className={
                      isActive
                        ? 'bg-orange-500/15 text-orange-400 hover:bg-orange-500/30 border-l-4 border-orange-500 rounded-l-none font-bold transition-all duration-200'
                        : 'text-white hover:bg-orange-500/20 hover:text-orange-400 border-l-4 border-transparent hover:border-orange-500/50 rounded-l-none font-medium transition-all duration-200'
                    }
                  >
                    <Link href={item.url} className="flex items-center gap-4 px-4 py-3.5">
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
          <div className="flex aspect-square size-12 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400 shrink-0">
            <User className="size-6" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold text-white text-sm">
              {isAdmin && sysAdminUser
                ? sysAdminUser.name || 'Admin User'
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
