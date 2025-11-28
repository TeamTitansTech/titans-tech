'use client';

import { useLocale } from 'next-intl';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { setLocale } from '@/lib/locale';
import { useTransition } from 'react';
import { useInternalRouter } from '@/hooks/useInternalRouter';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useInternalRouter();
  const [_isPending, startTransition] = useTransition();

  const handleLanguageChange = async (newLocale: string) => {
    startTransition(async () => {
      // Set the locale cookie via server action
      await setLocale(newLocale);

      // Use router.refresh() to update the page with new locale
      router.refresh();
    });
  };

  return (
    <Tooltip>
      <DropdownMenu>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <button className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-orange-100 dark:hover:bg-orange-500/20 text-muted-foreground hover:text-orange-500 transition-all duration-200">
              <Globe className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Language / Idioma</TooltipContent>
        <DropdownMenuContent align="end" className="w-48">
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`cursor-pointer hover:bg-orange-100 hover:text-orange-500 ${
                language.code === locale ? 'bg-orange-50 dark:bg-orange-500/10' : ''
              }`}
            >
              <span className="mr-2">{language.flag}</span>
              <span>{language.name}</span>
              {language.code === locale && <span className="ml-auto text-orange-500">✓</span>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </Tooltip>
  );
}
