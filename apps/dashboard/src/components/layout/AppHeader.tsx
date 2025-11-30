'use client';

import { useInternalRouter } from '@/hooks/useInternalRouter';
import { PanelLeft, UserCircle, LogOut, Moon, Sun } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from './LanguageSwitcher';
import { NotificationsDropdown } from '../notifications/NotificationsDropdown';
import { useTheme } from 'next-themes';
import { logout } from '@/data/services/auth.api';
import { useSysAdmin } from '@/contexts/SysAdminContext';
import { useCompanyUser } from '@/contexts/CompanyUserContext';

export function AppHeader() {
  const router = useInternalRouter();
  const { toggleSidebar } = useSidebar();
  const t = useTranslations('header');
  const { theme, setTheme } = useTheme();
  const { setSysAdminUser } = useSysAdmin();
  const { setCompanyUser } = useCompanyUser();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    await logout();
    setSysAdminUser(null);
    setCompanyUser(null);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background dark:bg-card">
      <div className="flex h-16 items-center gap-4 px-6">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={toggleSidebar}
              className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent/10 dark:hover:bg-accent/20 text-muted-foreground hover:text-accent transition-all duration-200"
            >
              <PanelLeft className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>{t('toggleSidebar')}</TooltipContent>
        </Tooltip>

        <div className="flex items-center gap-2 ml-auto">
          <NotificationsDropdown />

          <LanguageSwitcher />

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleTheme}
                className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent/10 dark:hover:bg-accent/20 text-muted-foreground hover:text-accent transition-all duration-200"
                aria-label={t('toggleTheme')}
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </button>
            </TooltipTrigger>
            <TooltipContent>{t('toggleTheme')}</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent/10 dark:hover:bg-accent/20 text-muted-foreground hover:text-accent transition-all duration-200">
                <UserCircle className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Admin User</p>
                  <p className="text-xs leading-none text-muted-foreground">admin@inspectpro.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer hover:bg-red-100 hover:text-red-500"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t('logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
