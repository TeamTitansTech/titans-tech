'use client';

import * as React from 'react';
import {
  LayoutDashboard,
  Wrench,
  FolderKanban,
  User,
  LogOut,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// This is the data structure for the sidebar
const data = {
  company: {
    name: 'InspectPro',
    subtitle: 'Admin Portal',
    logo: Wrench,
  },
  navMain: [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      url: '/home',
    },
    {
      title: 'Blueprints',
      icon: FolderKanban,
      url: '/blueprints',
    },
    {
      title: 'Machines',
      icon: Wrench,
      url: '/machines',
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="p-6 border-b border-gray-700/50">
        <div className="flex items-center justify-between gap-2">
          <SidebarMenu className="flex-1">
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
                <Link href="/home" className="flex items-center gap-3">
                  <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-orange-500 text-white shrink-0">
                    <data.company.logo className="size-6" />
                  </div>
                  <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-bold text-lg ">{data.company.name}</span>
                    <span className="truncate text-[10px] uppercase tracking-wide font-semibold">
                      {data.company.subtitle}
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <button
            onClick={toggleSidebar}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md hover:bg-gray-800/50  hover:text-white transition-colors group-data-[collapsible=icon]:hidden"
            title="Toggle Sidebar"
          >
            {state === 'expanded' ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeftOpen className="h-4 w-4" />
            )}
          </button>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 py-6">
        <SidebarGroup className="px-0">
          <SidebarGroupLabel className="text-xs font-bold tracking-wide text-gray-600 uppercase px-3 mb-3 group-data-[collapsible=icon]:hidden">
            Navigation
          </SidebarGroupLabel>
          <SidebarMenu className="space-y-1">
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
                        ? 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/15 border-l-[3px] border-orange-500 rounded-l-none font-semibold'
                        : ' hover:bg-orange-500/5 hover:text-orange-300 border-l-[3px] border-transparent rounded-l-none font-semibold transition-colors'
                    }
                  >
                    <Link href={item.url} className="flex items-center gap-3 px-3 py-3">
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
      <SidebarFooter className="border-t border-gray-700/50 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="hover:bg-gray-800/50 data-[state=open]:bg-gray-800/50"
                >
                  <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400 shrink-0">
                    <User className="size-5" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-semibold text-white">Admin User</span>
                    <span className="truncate text-xs text-gray-400">admin@inspectpro.com</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 bg-[#1a1d29] border-gray-700"
                side="top"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem className="gap-2 text-gray-600 hover:text-white hover:bg-gray-800/50 cursor-pointer">
                  <User className="size-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-gray-200 hover:text-white hover:bg-gray-800/50 cursor-pointer">
                  <Settings className="size-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer">
                  <LogOut className="size-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
