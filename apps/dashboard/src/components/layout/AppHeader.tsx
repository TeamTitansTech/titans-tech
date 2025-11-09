'use client';

import { PanelLeft, Search, Bell, UserCircle, LogOut } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslations } from 'next-intl';

export function AppHeader() {
  const { toggleSidebar } = useSidebar();
  const t = useTranslations('header');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="flex h-16 items-center gap-4 px-6">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={toggleSidebar}
              className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-orange-100 text-gray-600 hover:text-orange-500 transition-all duration-200"
            >
              <PanelLeft className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>{t('toggleSidebar')}</TooltipContent>
        </Tooltip>

        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="search"
              placeholder={t('searchPlaceholder')}
              className="w-full h-10 pl-10 pr-4 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-orange-100 text-gray-600 hover:text-orange-500 transition-all duration-200">
                <Bell className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>{t('notifications')}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-orange-100 text-gray-600 hover:text-orange-500 transition-all duration-200">
                <UserCircle className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>{t('userProfile')}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-red-100 text-gray-600 hover:text-red-500 transition-all duration-200">
                <LogOut className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>{t('logout')}</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
