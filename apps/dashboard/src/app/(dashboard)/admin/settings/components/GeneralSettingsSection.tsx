'use client';

import { useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

type UnitSystem = 'metric' | 'imperial';

const SUPPORTED_LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
] as const;

export function GeneralSettingsSection() {
  const t = useTranslations('adminSettings.generalSettings');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');

  const handleLanguageChange = (newLocale: string) => {
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
      toast.success(t('saved'));
    });
  };

  const handleUnitSystemChange = (value: UnitSystem) => {
    setUnitSystem(value);
    toast.success(t('saved'));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <div className="space-y-2">
          <Label htmlFor="language">{t('language.label')}</Label>
          <Select value={locale} onValueChange={handleLanguageChange} disabled={isPending}>
            <SelectTrigger id="language">
              <SelectValue placeholder={t('language.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LOCALES.map((loc) => (
                <SelectItem key={loc.code} value={loc.code}>
                  {loc.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="unitSystem">{t('unitSystem.label')}</Label>
          <Select value={unitSystem} onValueChange={handleUnitSystemChange}>
            <SelectTrigger id="unitSystem">
              <SelectValue placeholder={t('unitSystem.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="metric">{t('unitSystem.metric')}</SelectItem>
              <SelectItem value="imperial">{t('unitSystem.imperial')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-sm text-muted-foreground max-w-4xl">{t('autoSaveNotice')}</p>
    </div>
  );
}
