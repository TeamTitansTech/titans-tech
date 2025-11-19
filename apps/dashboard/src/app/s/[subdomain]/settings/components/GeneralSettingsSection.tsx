'use client';

import { useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useInternalRouter } from '@/hooks/useInternalRouter';
import { setUserLocale } from '@/actions/locale';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Settings2 } from 'lucide-react';
import { toast } from 'sonner';

type UnitSystem = 'metric' | 'imperial';

const SUPPORTED_LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
  { code: 'es', label: 'Español' },
] as const;

export function GeneralSettingsSection() {
  const t = useTranslations('settings.generalSettings');
  const locale = useLocale();
  const router = useInternalRouter();
  const [isPending, startTransition] = useTransition();
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');

  const handleLanguageChange = (newLocale: string) => {
    startTransition(async () => {
      await setUserLocale(newLocale);
      router.refresh();
      toast.success(t('saved'));
    });
  };

  const handleUnitSystemChange = (value: UnitSystem) => {
    setUnitSystem(value);
    toast.success(t('saved'));
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div className="flex items-center gap-3">
          <Settings2 className="h-5 w-5 mt-0.5" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold">{t('title')}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t('description')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        <p className="text-sm text-muted-foreground">{t('autoSaveNotice')}</p>
      </CardContent>
    </Card>
  );
}