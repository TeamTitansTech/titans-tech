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
  ChevronUp,
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
  const { toggleSidebar } = useSidebar();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="p-5 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <Link href="/home" className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-orange-500 text-white shrink-0">
              <data.company.logo className="size-6" />
            </div>
            <div className="grid flex-1 text-left leading-tight min-w-0 group-data-[collapsible=icon]:hidden">
              <span className="truncate font-bold text-base text-white">{data.company.name}</span>
              <span className="truncate text-[10px] uppercase tracking-wider font-medium text-gray-500">
                {data.company.subtitle}
              </span>
            </div>
          </Link>
          <button
            onClick={toggleSidebar}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md hover:bg-gray-800/50 text-gray-300 hover:text-white transition-all group-data-[collapsible=icon]:hidden"
            title="Toggle Sidebar"
          >
            <PanelLeftClose className="h-5 w-5" />
          </button>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 py-6">
        <SidebarGroup className="px-0">
          <SidebarGroupLabel className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase px-3 mb-4 group-data-[collapsible=icon]:hidden">
            Navigation
          </SidebarGroupLabel>
          <SidebarMenu className="space-y-2">
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
                        ? 'bg-orange-500/15 text-orange-400 hover:bg-orange-500/20 border-l-4 border-orange-500 rounded-l-none font-bold'
                        : 'text-white hover:bg-orange-500/5 hover:text-orange-300 border-l-4 border-transparent rounded-l-none font-semibold transition-colors'
                    }
                  >
                    <Link href={item.url} className="flex items-center gap-3 px-4 py-3.5">
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
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="hover:bg-gray-800/50 data-[state=open]:bg-gray-800/50 h-auto py-2.5"
                >
                  <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400 shrink-0">
                    <User className="size-5" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-semibold text-white text-sm">Admin User</span>
                    <span className="truncate text-xs text-gray-400">admin@inspectpro.com</span>
                  </div>
                  <ChevronUp className="ml-auto size-4 text-gray-400 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 bg-[#1e293b] border-slate-600"
                side="top"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem className="gap-2 text-white hover:text-white hover:bg-gray-800/50 cursor-pointer">
                  <User className="size-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-white hover:text-white hover:bg-gray-800/50 cursor-pointer">
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
