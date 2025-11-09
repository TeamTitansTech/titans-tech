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
  Building2,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const t = useTranslations();

  // This is the data structure for the sidebar
  const data = {
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
        title: t('navigation.companies'),
        icon: Building2,
        url: '/companies',
      },
      {
        title: t('navigation.models'),
        icon: FolderKanban,
        url: '/blueprints',
      },
      {
        title: t('navigation.clients'),
        icon: Users,
        url: '/clients',
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

  return (
    <Sidebar collapsible="offcanvas" className="shadow-lg" {...props}>
      <SidebarHeader className="p-5 border-b border-slate-700/50">
        <Link href="/home" className="flex items-center gap-3">
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
        {/* Main Navigation */}
        <SidebarGroup className="px-0">
          <SidebarMenu className="space-y-2.5">
            {data.navMain.map((item) => {
              const isActive = pathname === item.url || pathname.startsWith(`${item.url}/`);
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

        {/* Utility Navigation (Settings) */}
        <SidebarGroup className="px-0 mt-6">
          <SidebarMenu>
            {data.navUtility.map((item) => {
              const isActive = pathname === item.url || pathname.startsWith(`${item.url}/`);
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
            <span className="truncate font-semibold text-white text-sm">Admin User</span>
            <span className="truncate text-xs text-gray-400">admin@inspectpro.com</span>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
